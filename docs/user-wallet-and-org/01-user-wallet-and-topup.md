# ۰۱ — کیف پول شخصی و شارژ (Back + Front + Panel)

**وابستگی:** HW-02 (دفترکل مشترک، نسخهٔ ۲) و XC-1 (زبان کاربر).
**خروجی:**
- حساب‌های کیف پول هر کاربر (شارژ، کارت هدیه، اعتبار سازمانی) با موجودی به تفکیک منبع و تاریخ انقضا
- شارژ با درگاه
- صفحهٔ «کیف پول جایاب» برای مهمان و میزبان
- هشدار انقضا
- نمای فقط‌خواندنی پشتیبان و مالی
- درخواست برگرداندن ماندهٔ شارژ

---

## OW-1.1 — سرویس کیف پول کاربر (Back)

**پوشه:** `Back/src/wallet/roles/user/` (همان `WalletModule` HW-02).

```ts
UserWalletService.summary(userId): Promise<{
  total_available: number,
  sources: Array<{
    type: 'USER_TOPUP' | 'USER_GIFT' | 'EMPLOYEE_ORG_CREDIT',
    organization?: { id, name },          // EMPLOYEE_ORG_CREDIT
    available: number, held: number,
    next_expiry: { amount: number, at: string } | null,
  }>,
}>
UserWalletService.history(userId, cursor): Promise<Array<{ at, kind, amount, source, reserve_code?, title_key }>>
```

- **حساب کارمند:** حساب `EMPLOYEE_ORG_CREDIT` با `employee_id` ساخته می‌شود، نه `user_id`. `summary` با پیوند `OrganizationEmployee.user_id` (OW-05) به کاربر وصل می‌شود.
- **`history`:** از ردیف‌های دفترکل همهٔ حساب‌های قابل خرج کاربر ساخته می‌شود.
  - هر خرج یک ردیف است (`reserve:{id}:spend:*` جمع زده می‌شود).
  - `kind` یکی از `TOPUP`، `GIFT_REDEEM`، `ORG_CHARGE`، `SPEND`، `REFUND`، `EXPIRE` یا `HOLD_RELEASE` است.
  - متن هر ردیف در Front از `title_key` ترجمه می‌شود (XC-4).

## OW-1.2 — شارژ با درگاه

| متد | مسیر | کار |
| --- | --- | --- |
| GET | `/api/v1/wallet` | `summary` |
| GET | `/api/v1/wallet/history?cursor=` | `history`، صفحه‌های ۲۰تایی |
| POST | `/api/v1/wallet/topup` | بدنه `{ amount, redirect_url, gateway? }` ← `{ payment_url }` |

- **`topup`:**
  - مبلغ بین `WALLET_TOPUP_MIN` و `WALLET_TOPUP_MAX` باشد و `WALLET_TOPUP_ENABLED = 1`.
  - پرداخت با `PaymentUserService.create(..., TurnoverType.CHARGE_CREDIT)` ساخته می‌شود. این نوع از قبل در enum هست.
- **کال‌بک:** در switch کال‌بک (`Back/src/payment/roles/user/user.controller.ts:65-75`) یک `case TurnoverType.CHARGE_CREDIT` اضافه می‌شود که در تراکنش:
  - `addLot(USER_TOPUP, source = TOPUP, amount, expiresAt = null, ref = Payment)`
  - `move(null → AVAILABLE)` با کلید `topup:{paymentId}`
  - بعد از commit، پیامک `WALLET_TOPUP` به زبان کاربر فرستاده می‌شود.
- **میزبان هم کیف پول شخصی دارد.** این حساب جدا از «مطالبات میزبان» (`HOST_RECEIVABLE`، HW-04) است و این دو با هم جمع نمی‌شوند.

## OW-1.3 — هشدار انقضا

یک `@Cron` روزانه (ساعت ۱۰ تهران) در `Back/src/tasks/tasks.service.ts`:
- lotهای `USER_GIFT` و `EMPLOYEE_ORG_CREDIT` را که ۳۰ روز و ۷ روز دیگر منقضی می‌شوند و موجودی دارند پیدا می‌کند.
- پیامک `CREDIT_EXPIRING` و اعلان داخل اپ می‌فرستد، **هر کدام یک بار** برای هر lot و هر بازه. یکتایی با دو ستون `notified_30_at` و `notified_7_at` روی `WalletLot` تضمین می‌شود. این دو ستون در migration همین بسته به جدول `wallet_lots` اضافه می‌شوند.
- خود انقضا را HW-2.6 انجام می‌دهد.

---

## OW-1.4 — صفحهٔ «کیف پول جایاب» (Front)

- **مسیر:** `Front/app/(profile)/profile/wallet/page.tsx`.
- **منو:** «کیف پول جایاب» در `Front/features/user/hooks/useProfileMenu.ts` برای همهٔ کاربران. برای مالک، زیر آن لینک «مطالبات میزبانی» به `/profile/owner/wallet` (HW-04).
- **ساختار:**
  1. **کارت موجودی کل** با دکمه‌های «افزایش موجودی» و «واردکردن کارت هدیه» (OW-03).
  2. **کارت‌های منبع:** شارژ شخصی، کارت هدیه و اعتبار سازمانی (با نام سازمان). هر کدام موجودی و «{مبلغ} تا {تاریخ} منقضی می‌شود» را نمایش می‌دهد. منبع خالی نمایش داده نمی‌شود، به جز شارژ شخصی.
  3. **شارژ:** sheet با مبلغ‌های سریع (۵۰۰ هزار، ۱، ۲ و ۵ میلیون)، فیلد مبلغ دلخواه با حداقل و حداکثر سرور، و دکمهٔ «پرداخت». بعد از برگشت از درگاه (`?topup=ok`)، cache به‌روز شود.
  4. **تاریخچه:** صفحه‌بندی بی‌نهایت با آیکن هر نوع. خرج‌ها به رزرو لینک دارند.
  5. **«قوانین کیف پول و کارت هدیه»** (متن OW-0.1) در یک `ModalBottomSheet`.
- **بدون دکمهٔ برداشت.** متن کمکی: «برای برگرداندن ماندهٔ شارژ شخصی به حساب بانکی، از پشتیبانی درخواست کنید. اعتبار کارت هدیه و اعتبار سازمانی قابل برگرداندن نیستند.»
- **API و hookها:** `Front/api_services/wallet/` (مشترک با HW-04)، و `useUserWallet`، `useWalletHistory` و `useTopup` در `Front/features/wallet/hooks/`.
- **سه زبان و دو تم (XC-4):** namespace `wallet`. همهٔ مبلغ‌ها با `formatTomanAmount` و تاریخ‌ها با `formatJalaliDisplay`.
- **در header:** یک نمایش کوچک موجودی کل کنار آواتار، فقط وقتی موجودی بزرگ‌تر از صفر است.

## OW-1.5 — نمای پشتیبان و مالی (Panel)

- **Back:** `admin/user-wallets` (ماژول `user-wallets`). فقط GET: جستجو با شمارهٔ موبایل، خلاصهٔ حساب‌ها، lotها با منشأ و انقضا، و تاریخچه. هیچ endpoint تغییری ندارد.
- **Panel:** `Panel/app/user-wallets/page.tsx` و `show/[userId]/page.tsx`. متن‌ها از `Panel/dictionary/{fa,ar,en}.json` با namespace `userWallets` (XC-5) خوانده می‌شوند. صفحه در تم روشن و تاریک NextUI بررسی می‌شود.
- **میز کار پشتیبان:** کارت مالی (HW-7.1) برای رزروی که با کیف پول پرداخت شده، «منبع پرداخت: کارت هدیه ۵٬۰۰۰٬۰۰۰ + درگاه ۹٬۰۰۰٬۰۰۰» را هم نمایش می‌دهد.

## OW-1.6 — برگرداندن ماندهٔ شارژ (E2)

- در `Panel/app/user-wallets/show/[userId]`، کاربری با ماژول `org-payments` یا `guest-refunds` (نقش مالی) دکمهٔ «ثبت درخواست برگرداندن شارژ» را دارد. پشتیبان این دکمه را ندارد.
- **Back:** `POST /admin/user-wallets/:userId/topup-refund` با بدنهٔ `{ amount, note }` در تراکنش:
  - موجودی `AVAILABLE` حساب `USER_TOPUP` کاربر (و فقط همین حساب) به `VOID` با کلید `topup-refund:{guestRefundId}` منتقل می‌شود.
  - یک `GuestRefund` با `source = TOPUP_REFUND` در `AWAITING_INFO` ساخته می‌شود.
  - ادامه همان فلوی HW-6.4 است (شبای کاربر و واریز دو نفره).
- اعتبار کارت هدیه و سازمانی هرگز وارد این فلو نمی‌شوند.

---

## معیار پذیرش فاز

- [ ] شارژ ۱ میلیونی با sandbox → یک lot `TOPUP` بدون انقضا، موجودی ۱ میلیون و پیامک به زبان کاربر. کال‌بک تکراری lot دوم نمی‌سازد.
- [ ] مبلغ خارج از حداقل و حداکثر با پیام ترجمه‌شده رد می‌شود.
- [ ] صفحهٔ کیف پول برای مهمان و میزبان در fa، ar و en و تم روشن و تاریک درست است (XC-7). مطالبات میزبانی با موجودی شخصی جمع نمی‌شود.
- [ ] هشدار ۳۰ روزه و ۷ روزه برای هر lot فقط یک بار فرستاده می‌شود.
- [ ] پشتیبان کیف پول کاربر را در Panel می‌بیند و هیچ دکمهٔ تغییری ندارد. مالی ماندهٔ شارژ را برمی‌گرداند ولی نمی‌تواند اعتبار هدیه را برگرداند.
- [ ] Back، Front و Panel: lint، build و test. سپس `/security-review`.
