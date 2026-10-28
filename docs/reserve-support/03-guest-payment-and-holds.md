# ۰۳ — پرداخت مهمان، رزرو قطعی و ثبت طلب میزبان (Back)

**وابستگی:** فاز ۰۲ (قفل موقت و وضعیت ۴۰). **باید همزمان با HW-01 و HW-02 بستهٔ کیف پول ساخته شود.** HW-01 پله‌های عددی قوانین کنسلی را می‌سازد که در snapshot ذخیره می‌شوند، و HW-02 دفترکل است. **پیش‌نیاز روشن کردن سوئیچ:** بله.
**خروجی:** endpoint پرداخت رزرو با مهلت ۱۰ دقیقه، کال‌بک `PAY_RESERVE`، رزرو قطعی، ثبت شب‌ها در تقویم، snapshot مالی و طلب میزبان در دفترکل، حالت تعارض، و خروجی کارت رزرو مهمان.

---

## RS-3.1 — شروع پرداخت

`POST /api/v1/reserves/:propertyReserveId/pay` در `Back/src/property-reserve/roles/user/user.controller.ts` با گارد موجود کلاس (`UserJwtGuard`):

```ts
class PayPropertyReserveUserDto {
  redirect_url: string;          // same pattern as PaySubscriptionPropertyOwnerDto
  gateway?: PaymentGatewayEnum;  // same enum and default as the subscription purchase
}
// result: { payment_url: string }
```

- مالکیت با `findById` (خط ۱۵۲ سرویس) چک شود که `RESERVE4` می‌دهد.
- **شرط‌ها:** `flow = 3`، `status ∈ {40, 70}` و `pay_deadline_at > now`. در غیر این صورت 422 با کد جدید `RESERVE_PAY_CLOSED`: «مهلت ۱۰ دقیقه‌ای پرداخت این رزرو تمام شده است.»
- اگر پرداختی با `APPROVED` برای این رزرو وجود دارد → 409.
- مبلغ فقط از سرور خوانده می‌شود: برای ۴۰ `quoted_total` و برای ۷۰ `offer_total`.
- `findBlockedNights(..., excludeReserveId)` دوباره چک شود.
- **در یک تراکنش:**
  - `PaymentUserService.create(user, amount, redirect_url, gateway, TurnoverType.PAY_RESERVE, tx)` (`Back/src/payment/roles/user/user.service.ts:39`)
  - `payment.property_id` و `reserve.payment_id = payment.id`. پرداخت ناتمام قبلی جایگزین می‌شود.
  - لاگ `PAYMENT_STARTED`.

**ماژول‌ها:** `PropertyReserveUserModule` ماژول `PaymentUserModule` را import می‌کند. منطق کال‌بک در `ReservePaymentService` (`Back/src/property-reserve/common/services/`) داخل یک ماژول کوچک `ReservePaymentModule` است که `PaymentUserModule` را import **نمی‌کند**، ولی `WalletModule` (HW-02) را import می‌کند. ماژول پرداخت فقط همین ماژول کوچک را import می‌کند تا حلقه ساخته نشود.

---

## RS-3.2 — کال‌بک و رزرو قطعی

در `Back/src/payment/roles/user/user.controller.ts`، switch خطوط ۶۵ تا ۷۵:

```ts
case TurnoverType.PAY_RESERVE:
  await this.reservePaymentService.onPaid(payment);
  break;
```

نوع `result` (خط ۴۷) فقط برای اشتراک است. یا به union تبدیل شود، یا شاخهٔ رزرو قبل از استفاده از آن برگردد. کال‌بک تکراری با `checkAuthority` موجود رد می‌شود (`Back/src/payment/roles/user/user.service.ts:242-253`)، چون فقط پرداخت `INIT` معتبر است.

**`ReservePaymentService.onPaid(payment)`:**

1. **تراکنش:**
   - `payment` به `APPROVED` با `ref_id = uuidv7()` تغییر کند (مثل `subscriptionPaymentCallback`، خط ۱۲۰ به بعد).
   - رزرو با `payment_id = payment.id` پیدا شود. اگر نبود (پرداخت قدیمی جایگزین‌شده)، یک `GuestRefund` با منبع `ORPHAN_PAYMENT` ساخته شود (HW-06) و اعلان `RESERVE_REFUND_REQUIRED` برود.
   - شب‌های نهایی: برای ۷۰ از `offer_*` و برای بقیه از `check_in` و `check_out`.
   - **تعارض:** اگر `findBlockedNights(..., excludeReserveId)` شبی برگرداند → `[40, 70, 110] → 130` با `PAID_CONFLICT`، یک `GuestRefund` صددرصدی با منبع `CONFLICT` (HW-06) و اعلان `RESERVE_REFUND_REQUIRED`. **هیچ طلبی برای میزبان ثبت نمی‌شود.**
   - **در غیر این صورت:**
     - `[40, 70, 110] → 90` با `paid_at = now`. ورود از ۱۱۰ فقط وقتی مجاز است که `payment_id` همین پرداخت باشد، یعنی مهمان قبل از پایان ۱۰ دقیقه وارد درگاه شده و بعد از آن برگشته است.
     - اگر از ۷۰ آمده: `check_in`، `check_out`، `guests_count`، `nights` و `quoted_total` با مقادیر پیشنهاد جایگزین شوند و `host_share` و `commission` از روی آن دوباره محاسبه شوند. مقادیر قبلی در لاگ `OFFER_ACCEPTED` می‌مانند.
     - **`WalletService.recordReserveCredit(reserve, payment, tx)` (HW-02):** snapshot مالی (مبلغ پرداختی، نرخ ۲۰٪، سهم جایاب، سهم میزبان، قانون کنسلی و پله‌هایش، زمان آزادسازی) و یک ردیف دفترکل «ثبت طلب» با کلید یکتای `reserve:{id}:credit` در وضعیت `PENDING`.
2. **بعد از commit:**
   - شب‌ها در تقویم ثبت شوند: `PropertyCalendarOwnerService.bulkUpdateReserveStatus(propertyId, { is_reserved: true, days })` (`Back/src/property-calendar/roles/owner/owner.service.ts:140`). اگر شکست بخورد، رزرو ۹۰ همچنان در `findBlockedNights` حساب می‌شود و خطا لاگ می‌شود.
   - پیامک `RESERVE_CONFIRMED_GUEST` به مهمان و `RESERVE_CONFIRMED_HOST` به میزبان. متن میزبان همان متن سند کیف پول است.
   - اعلان داخل اپ به میزبان و اعلان ادمین `RESERVE_PAID`.
   - HW-03: اگر این اولین رزرو پرداخت‌شدهٔ میزبان است و شبای تأییدشده ندارد، پیامک و اعلان «تکمیل اطلاعات تسویه» فرستاده شود.

**روز تقویم:** تبدیل با `moment-jalaali` انجام شود (`jYear`، `jMonth() + 1`، `jDate`) و فقط شب‌های `[check_in, check_out)` ثبت شوند.

---

## RS-3.3 — خروجی رزرو برای مهمان

`serializer` (`Back/src/property-reserve/roles/user/user.service.ts:305`) برای `flow = 3` این فیلدها را اضافه کند. مسیرهای دیگر بدون تغییر می‌مانند.

| فیلد | مقدار |
| --- | --- |
| `jayab` | `true` |
| `response_promise_seconds_left` | فقط وقتی `first_response_at = null`: ثانیه تا `created_at + 21m`، حداقل صفر. بعد از اولین پاسخ `null` است. |
| `responded` | `first_response_at != null` |
| `can_pay` | `status ∈ {40, 70}` و `pay_deadline_at > now` |
| `pay_seconds_left` | ثانیه تا `pay_deadline_at` (حداکثر ۶۰۰) |
| `amount_payable` | ۴۰: `quoted_total`، ۷۰: `offer_total` |
| `offer` | برای ۷۰: `{ check_in, check_out, guests_count, total, note }` |
| `cancellation` | برای ۹۰: `{ policy, can_cancel, preview_url }` از HW-06 |
| `status.title` | از `PropertyReserveGuestStatusTitle` |

- `show_counter` و `ttl_seconds` موجود برای JAYAB به ترتیب برابر `can_pay || response_promise_seconds_left > 0` و همان ثانیه‌ها باشند، تا کارت فعلی Front بدون تغییر کار کند.
- `findAll` با `type = 'active'` (خط ۱۱۸) فقط ۲۴ ساعت اخیر را نشان می‌دهد. رزرو ۹۰ در مسیر JAYAB تا `check_out` و رزرو ۱۳۰ و ۱۴۰ تا تکمیل بازگشت وجه نمایش داده شوند (شرط `OR`).

---

## RS-3.4 — سهم میزبان

در **بستهٔ کیف پول** است: HW-02 (دفترکل و snapshot)، HW-04 (نمایش به میزبان) و HW-05 (تسویهٔ دستی). جدول `turnovers` استفاده نمی‌شود.

## RS-3.5 — میزبان بعد از رزرو قطعی

- لیست رزرو مالک برای ۹۰ نام و شمارهٔ مهمان (P6)، `host_share` و وضعیت طلب از HW-04 را برگرداند.
- `clickGuestMobile` موجود برای مسیر JAYAB وضعیت را به ۳۰ **تغییر ندهد**. شرط خط ۱۵۵ آن فقط برای `flow ≠ 3` اجرا شود.

## RS-3.6 — لغو بعد از پرداخت

در HW-06 بستهٔ کیف پول است: مهمان طبق قانون کنسلی آگهی لغو می‌کند، بازگشت وجه و سهم میزبان از پله‌های ذخیره‌شده در snapshot محاسبه می‌شوند، و وضعیت ۱۴۰ است. endpoint لغو قبل از پرداخت (RS-2.6) برای ۹۰ همچنان خطای `RESERVE5` می‌دهد.

---

## حالت‌های مرزی

| حالت | رفتار |
| --- | --- |
| مهمان در دقیقهٔ ۹ وارد درگاه و در دقیقهٔ ۱۲ برمی‌گردد | job انقضا یک بار ۳ دقیقه صبر می‌کند. اگر باز هم دیر شد، رزرو ۱۱۰ است، ولی چون `payment_id` همین است و تاریخ آزاد است، کال‌بک آن را ۹۰ می‌کند و طلب ثبت می‌شود. |
| دو مهمان با درخواست هم‌پوشان، میزبان هر دو را تأیید می‌کند | دومی در `hostReply` به `DATES_TAKEN` می‌رود |
| پرداخت از دو تب | دومی در `pay` خطای 409 می‌گیرد. اگر هر دو به درگاه رسیدند، دومی `ORPHAN_PAYMENT` و بازگشت وجه می‌شود. |
| پرداخت ناموفق در درگاه | رزرو ۴۰ یا ۷۰ می‌ماند و مهمان تا پایان ۱۰ دقیقه دوباره پرداخت می‌کند. هیچ طلبی ثبت نمی‌شود. |
| کال‌بک تکراری درگاه | `checkAuthority` رد می‌کند. اگر به هر دلیل به `onPaid` برسد، کلید یکتای `reserve:{id}:credit` طلب دوم نمی‌سازد. |
| ثبت تقویم بعد از commit شکست بخورد | `findBlockedNights` رزرو ۹۰ را حساب می‌کند و خطا لاگ می‌شود |

## امنیت و کارایی

- مبلغ، شب‌ها و وضعیت فقط از سرور خوانده می‌شوند.
- کال‌بک یک تراکنش کوتاه است. پیامک و اعلان بیرون تراکنش اجرا می‌شوند.
- بعد از پیاده‌سازی `/security-review` اجرا شود.

## معیار پذیرش فاز

- [ ] با درگاه `SANDBOX` روی jayab.org: تأیید میزبان، پرداخت در ۱۰ دقیقه → ۹۰، شب‌ها در تقویم پر، یک snapshot و یک ردیف «ثبت طلب» با مبلغ درست، پیامک به هر دو طرف با متن کیف پول و اعلان پنل.
- [ ] پرداخت بعد از ۱۰ دقیقه از endpoint رد می‌شود. ورود به درگاه قبل از مهلت و برگشت بعد از آن با تاریخ آزاد → ۹۰.
- [ ] پرداخت با تاریخ گرفته‌شده → ۱۳۰، بدون طلب، با یک `GuestRefund`.
- [ ] `POST /reserves/:id/pay` روی رزرو کاربر دیگر 403 و روی رزرو ۱۰ یا ۹۰ خطای 422 یا 409 می‌دهد.
- [ ] تست واحد `onPaid`: تعارض، پرداخت جایگزین‌شده، ورود از ۷۰ و عدم تکرار طلب.
- [ ] تست‌های موجود `Back/src/payment/roles/user/*.spec.ts` پاس می‌شوند.
