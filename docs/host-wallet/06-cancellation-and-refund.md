# ۰۶ — لغو بعد از پرداخت و بازگشت وجه (Back + Front + Panel)

**وابستگی:** HW-01 (تابع محاسبه)، HW-02 (دفترکل) و HW-05 (الگوی حواله و پنل مالی). **پیش‌نیاز اولین لغو بعد از پرداخت:** بله. تا آماده شدن این فاز، Front دکمهٔ لغو رزرو قطعی را نمایش نمی‌دهد.
**خروجی:**
- لغو رزرو قطعی توسط مهمان در اپ، طبق قانون کنسلی آگهی
- لغو با تماس، توسط پشتیبان، از طرف مهمان یا میزبان
- رکورد اصلاحیهٔ مالی و اصلاح طلب در دفترکل
- آزاد شدن تقویم
- بازگشت وجه مهمان توسط واحد مالی، برای لغو، تعارض تاریخ (۱۳۰) و پرداخت جایگزین‌شده

**تصمیم کارفرما:** قانون کنسلی‌ای که میزبان برای آگهی انتخاب کرده، سهم میزبان در لغو را تعیین می‌کند. پله‌های قانون از snapshot لحظهٔ پرداخت خوانده می‌شوند، نه از جدول فعلی (D7).

---

## HW-6.1 — سرویس لغو (Back)

`CancellationService.cancelPaidReserve(reserveId, by: 'GUEST' | 'HOST', actor, opts?: { iban?, holderName? })` در `Back/src/wallet/services/`:

1. **پیش‌شرط‌ها:** `status = 90`، snapshot وجود دارد، و موجودی رزرو در `PROCESSING` یا `SETTLED` نیست. اگر هست، 409 با کد `CANCEL_AFTER_SETTLEMENT`. این حالت به رسیدگی دستی مالی ارجاع می‌شود. در عمل پیش نمی‌آید، چون لغو فقط قبل از ساعت ورود ممکن است و اولین آزادسازی ۲۴ ساعت بعد از ورود است (HW-2.5). مشکل بعد از ورود از مسیر گزارش تحویل (HW-09) رسیدگی می‌شود، نه از لغو.
2. **محاسبه:**
   - `by = 'GUEST'`: `computeCancellation({ tiers: snapshot.cancel_tiers, checkInAt: snapshot.check_in_at, now, guestPaid: snapshot.guest_paid, feePercent: snapshot.fee_percent })`. اگر `allowed = false` (ساعت ورود گذشته)، خطای 422 با کد `CANCEL_AFTER_CHECKIN`.
   - `by = 'HOST'` (D6): بازگشت صددرصدی، سهم میزبان صفر و سهم جایاب صفر.
3. **تراکنش با قفل میزبان:**
   - `ReserveCancellation` با همهٔ اعداد محاسبه.
   - `ReserveFlowService.transition(90 → 140)` با `canceled_by` و لاگ `CANCELED_AFTER_PAYMENT`.
   - `WalletService.voidForCancellation(reserveId, snapshot.host_amount - newHostAmount)`: موجودی از `PENDING` (یا `AVAILABLE` اگر آزاد شده) به `VOID` با کلید `reserve:{id}:cancel`. بقیهٔ طلب سر جایش می‌ماند و در `release_at` اصلی آزاد می‌شود.
   - مبلغ بازگشتی طبق HW-6.6 بین «برگشت به کیف پول» و «برگشت به حساب بانکی» تقسیم می‌شود. بخش کیف پول همان لحظه به lotهای جدید برمی‌گردد. اگر `refund_to_bank > 0`، یک `GuestRefund` با `source = by === 'GUEST' ? 'CANCEL' : 'HOST_CANCEL'` و همین مبلغ ساخته می‌شود: اگر شبا داده شده `READY`، وگرنه `AWAITING_INFO`.
   - لاگ ممیزی `RESERVE_CANCELED`.
4. **بعد از commit:**
   - شب‌های `[check_in, check_out)` با `bulkUpdateReserveStatus(propertyId, { is_reserved: false, days })` آزاد شوند.
   - پیامک `RESERVE_CANCELED_HOST` با سهم جدید و `RESERVE_CANCELED_GUEST` با مبلغ بازگشت. اگر شبا نیامده، `REFUND_INFO` با لینک فرستاده شود.
   - اعلان ادمین `RESERVE_REFUND_REQUIRED`.

**سابقه حذف نمی‌شود:** snapshot و ردیف `credit` دست نمی‌خورند. اصلاحیه فقط یک ردیف `VOID` و یک `ReserveCancellation` اضافه می‌کند (سند، بند ۱۴).

---

## HW-6.2 — APIهای مهمان

در `Back/src/property-reserve/roles/user/user.controller.ts`، با مالکیت چک‌شده با `findById`:

| متد | مسیر | کار |
| --- | --- | --- |
| GET | `/api/v1/reserves/:id/cancel-preview` | `{ allowed, policy: { id, title, tiers }, hours_before, refund_percent, refund_amount, next_tier_at, next_refund_percent }`. مهمان سهم میزبان یا جایاب را نمی‌بیند. |
| POST | `/api/v1/reserves/:id/cancel-paid` | بدنه `{ iban?: string, confirm: true }` → `cancelPaidReserve(..., 'GUEST')` |
| PUT | `/api/v1/reserves/:id/refund-info` | بدنه `{ iban: string }` برای `GuestRefund` در `AWAITING_INFO` → `READY`. منابع CANCEL، CONFLICT و ORPHAN_PAYMENT را پوشش می‌دهد. |

- `iban` با همان `validateIban` (HW-3.1) چک و با `seal` ذخیره شود. نام صاحب حساب را مهمان وارد می‌کند و واحد مالی هنگام واریز بررسی می‌کند (D8).
- محدودیت تعداد درخواست مثل endpointهای مالی دیگر اعمال شود.

## HW-6.3 — لغو توسط پشتیبان

به کنترلر پشتیبان (`Back/src/property-reserve/roles/support/support.controller.ts`، RS-5.1) اضافه شود:

- `POST /admin/reserve-support/:id/cancel` با بدنهٔ `{ by: 'GUEST' │ 'HOST', note: string }`.
- پشتیبان مبلغی وارد نمی‌کند و فقط درخواست را ثبت می‌کند. محاسبه همان HW-6.1 است.
- `GuestRefund` همیشه در `AWAITING_INFO` ساخته می‌شود و پیامک `REFUND_INFO` برای مهمان می‌رود.
- در میز کار پشتیبان، کارت رزرو ۹۰ دکمهٔ «لغو به درخواست مهمان» و «لغو از طرف میزبان» دارد. قبل از ثبت، پیش‌نمایش مبلغ از `cancel-preview` با `ConfirmModal` نمایش داده می‌شود.
- این کار با مرزبندی «پشتیبان فقط مشاهدهٔ مالی» تناقض ندارد، چون پشتیبان هیچ عدد یا شبایی را تغییر نمی‌دهد. اگر کارفرما بخواهد لغو فقط با نقش مالی ممکن باشد، فقط این endpoint به ماژول `guest-refunds` منتقل می‌شود.

---

## HW-6.4 — بازگشت وجه مهمان در پنل مالی

**مسیر Back:** `admin/guest-refunds` (ماژول `guest-refunds`):

| متد | مسیر | کار |
| --- | --- | --- |
| GET | `/admin/guest-refunds?status=` | صف با کد رزرو، مهمان، منبع، مبلغ، شبای ماسک‌شده، وضعیت و سن درخواست |
| GET | `/admin/guest-refunds/:id` | جزئیات با شبای کامل (لاگ `IBAN_VIEWED`) |
| POST | `/admin/guest-refunds/:id/process` | بدنه `{ paid_on, source_account, tracking_code, receipt_id?, note? }`. `READY → PROCESSING`. |
| PATCH | `/admin/guest-refunds/:id/confirm` | `PROCESSING → REFUNDED` (D2: نه توسط ثبت‌کننده) و پیامک `REFUND_DONE` |
| PATCH | `/admin/guest-refunds/:id/fail` | بدنه `{ reason }`. `PROCESSING → READY`. اگر شبا مشکل داشت `→ AWAITING_INFO` با پیامک دوباره. |

- **منابع:** `CANCEL`، `HOST_CANCEL`، `CONFLICT` (از RS-3.2، صددرصد) و `ORPHAN_PAYMENT` (از RS-3.2، صددرصد).
- قفل و یکتایی `tracking_code` مثل HW-5.3 است.
- **Panel:** `Panel/app/guest-refunds/page.tsx` (برگه‌ها: در انتظار اطلاعات، آمادهٔ واریز، در حال واریز، واریز شد، ناموفق) و `show/[id]/page.tsx` با همان الگوی پنجرهٔ حوالهٔ HW-5.8.

---

## HW-6.5 — لغو در Front

- **کارت رزرو ۹۰** (`ReservationCard`، RS-4.4): دکمهٔ «لغو رزرو» فقط وقتی `cancellation.can_cancel` برقرار است (قبل از ساعت ورود).
- **sheet لغو:**
  - عنوان «لغو رزرو طبق قانون {نام قانون}».
  - خط زمانی پله‌ها با پلهٔ فعلی برجسته (همان نمایش HW-1.5).
  - «مبلغ بازگشتی به شما: {refund_amount} تومان ({refund_percent}٪)».
  - اگر `next_tier_at` وجود دارد: «اگر تا {زمان} لغو کنید همین مبلغ برمی‌گردد. بعد از آن {next_refund_percent}٪.»
  - فیلد شبا برای بازگشت وجه با همان helper اعتبارسنجی HW-3.3. اگر بازگشت صفر است، فیلد شبا نمایش داده نمی‌شود.
  - checkbox «قانون کنسلی را خواندم و با مبلغ بالا موافقم».
  - دکمهٔ قرمز «لغو رزرو».
- **کارت ۱۳۰ و ۱۴۰:**
  - chip وضعیت بازگشت وجه: در انتظار شبا، آمادهٔ واریز، در حال واریز، واریز شد با شمارهٔ پیگیری، یا ناموفق.
  - برای `AWAITING_INFO`، فرم کوتاه شبا با `PUT refund-info`.
  - لینک پیامک `?refund={id}` همان کارت را باز کند.
- **میزبان:** کارت رزرو ۱۴۰ در رزروهای مالک «لغو توسط مهمان طبق قانون {نام} · سهم شما {مبلغ}» را نمایش دهد. کیف پول هم مبلغ اصلاح‌شده را نمایش می‌دهد (HW-4.1).
- **متن‌ها:** در namespaceهای `reserve` و `wallet`.

---

## HW-6.6 — بازگشت بخشی که از کیف پول پرداخت شده بود

کارفرما گفته است اعتبار کارت هدیه و اعتبار سازمانی «قابل نقد شدن نیست». پس پولی که از کیف پول خرج شده، هرگز به حساب بانکی برنمی‌گردد.

**تقسیم مبلغ بازگشتی (`refund_amount`):**
1. اول به منابع کیف پول به همان نسبتی که پرداخت شده بودند برمی‌گردد. نسبت از ردیف‌های `SPENT` با همین `reserve_id` خوانده می‌شود: اعتبار سازمانی، کارت هدیه و شارژ شخصی.
2. فقط مازاد آن (سهم درگاه) به `GuestRefund` و حساب بانکی می‌رود.

نمونه: رزرو ۱۴ میلیونی، ۵ میلیون از کارت هدیه و ۹ میلیون از درگاه، لغو با ۵۰٪ بازگشت (۷ میلیون). حدود ۲٫۵ میلیون به کیف پول کارت هدیه و ۴٫۵ میلیون به حساب بانکی برمی‌گردد. گرد کردن با درگاه تسویه می‌شود تا جمع دقیق بماند.

**lot برگشتی:**
- برای هر منبع یک lot جدید با `source = REFUND` در **همان حساب** (`USER_GIFT`، `EMPLOYEE_ORG_CREDIT` یا `USER_TOPUP`) ساخته می‌شود، با `ref` به lot اصلی و `move(null → AVAILABLE)` با کلید `reserve:{id}:refund:{lotId}`.
- **انقضای lot برگشتی** برابر `max(انقضای lot اصلی، now + 30 روز)` است، تا اعتباری که نزدیک انقضا خرج شده، بعد از لغو فوراً نسوزد. شارژ شخصی انقضا ندارد.
- `bonus_amount` lot برگشتی به همان نسبت lot اصلی است، تا تفکیک حسابداری حفظ شود.
- تفکیک در `ReserveCancellation.refund_to_wallet` و `refund_to_bank` ذخیره می‌شود.

**Front:** sheet لغو (HW-6.5) مبلغ را تفکیکی نمایش می‌دهد: «{x} تومان به کیف پول جایاب شما برمی‌گردد و {y} تومان به حساب بانکی.» فیلد شبا فقط وقتی `y > 0` باشد نمایش داده می‌شود.

---

## حالت‌های مرزی

| حالت | رفتار |
| --- | --- |
| مهمان دقیقاً روی مرز یک پله لغو می‌کند | زمان سرور ملاک است. پیش‌نمایش و ثبت هر دو با `now` سرور محاسبه می‌شوند. اگر بین پیش‌نمایش و ثبت پله عوض شد، ثبت با مبلغ جدید انجام می‌شود و پاسخ مبلغ واقعی را برمی‌گرداند. Front اگر مبلغ با پیش‌نمایش فرق داشت تأیید دوباره بخواهد. |
| بازگشت صفر (پلهٔ آخر قانون سخت‌گیرانه) | لغو انجام می‌شود، `GuestRefund` ساخته نمی‌شود و کل طلب میزبان طبق D5 (۸۰٪ کل) باقی می‌ماند |
| لغو بعد از آزادسازی ولی قبل از تسویه | `VOID` از `AVAILABLE` |
| لغو بعد از شروع تسویه | 409. رسیدگی دستی مالی، خارج از این نسخه. |
| میزبان شبا ندارد | بی‌اثر. لغو فقط طلب را کم می‌کند. |
| تغییر پله‌ها در Panel بعد از پرداخت | بی‌اثر روی این رزرو (D7) |

## معیار پذیرش فاز

- [ ] لغو مهمان در پلهٔ ۵۰٪: `ReserveCancellation` با `refund + hostAmount + feeAmount = guestPaid`، ردیف `VOID` با مبلغ درست، رزرو ۱۴۰، تقویم آزاد، دو پیامک و یک `GuestRefund` در `READY`.
- [ ] لغو بعد از ساعت ورود رد می‌شود. لغو از طرف میزبان بازگشت صددرصدی و سهم صفر دارد.
- [ ] تغییر پله‌ها در Panel روی پیش‌نمایش رزرو قبلاً پرداخت‌شده اثری ندارد.
- [ ] بازگشت وجه ۱۳۰: مهمان شبا را وارد می‌کند، حسابدار ثبت می‌کند و نفر دوم تأیید می‌کند، پیامک با شمارهٔ پیگیری.
- [ ] پشتیبان فقط با `cancel` لغو را ثبت می‌کند و به `admin/guest-refunds` خطای 403 می‌گیرد.
- [ ] Back: lint، test و tsc. Panel و Front: lint و build. سپس `/security-review`.
