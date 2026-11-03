# ۰۱ — قوانین کنسلی عددی (Back + Panel + Front)

**وابستگی:** HW-0.2 (پله‌های تأییدشده). **جدول این فاز در migration کیف پول (HW-2.1) است، پس HW-01 و HW-02 با هم merge می‌شوند.**
**خروجی:** پله‌های عددی سه قانون کنسلی، ویرایش آن‌ها در Panel، نمایش در صفحهٔ آگهی و مرحلهٔ قوانین مالک، و تابع خالص محاسبهٔ لغو که HW-06 از آن استفاده می‌کند.

**وضعیت فعلی:** enum `CancelingType` با مقدارهای `EASY`، `NORMAL` و `STRICT` در `Back/src/property/common/types/property-canceling-types.type.ts` است و `canceling_type` در مرحلهٔ قوانین اجباری است (`Back/src/property/roles/owner/dto/update-property.dto.ts:432-436`). شرح هر قانون متن آزاد CMS در دستهٔ `propertyRules` است که `Front/components/modules/PropertyDetails/parts/CancellationSummary.client.tsx` آن را به خط زمانی تبدیل می‌کند. هیچ عددی برای محاسبه وجود ندارد.

---

## HW-1.1 — مدل

```prisma
model CancellationPolicyTier {
  id                   Int      @id @default(autoincrement())
  policy               String   @db.VarChar(8)   // EASY | NORMAL | STRICT (CancelingType)
  min_hours_before     Int                         // applies when cancellation is at least this many hours before check-in
  guest_refund_percent Int      @db.SmallInt      // 0..100 of the amount the guest paid
  updated_by           Int?
  updated_at           DateTime @updatedAt

  @@unique([policy, min_hours_before])
  @@map("cancellation_policy_tiers")
}
```

- ردیف‌های اولیه از HW-0.2 در همان migration درج می‌شوند (`INSERT … ON CONFLICT DO NOTHING`).
- ماژول دسترسی `cancellation-policies` (نام: «قوانین کنسلی») هم در همان migration درج می‌شود.

**قاعدهٔ اعتبار هر قانون** (در سرور چک شود):
- دست‌کم یک پله با `min_hours_before = 0` وجود دارد.
- `min_hours_before` تکراری نیست و بزرگ‌تر یا مساوی صفر است.
- درصد بین ۰ و ۱۰۰ است.
- با بیشتر شدن ساعت، درصد بازگشت کمتر نمی‌شود.

---

## HW-1.2 — APIها (Back)

ماژول در `Back/src/wallet/cancellation-policy/`:

| متد | مسیر | دسترسی | کار |
| --- | --- | --- | --- |
| GET | `/api/v1/cancellation-policies` | عمومی، با cache یک ساعته | `{ EASY: { title, tiers[] }, NORMAL: …, STRICT: … }` |
| GET | `/api/v1/admin/cancellation-policies` | ماژول `cancellation-policies` (r) | همان، به‌اضافهٔ `updated_by` و `updated_at` |
| PUT | `/api/v1/admin/cancellation-policies/:policy` | همان ماژول (u) | بدنه `{ tiers: [{ min_hours_before, guest_refund_percent }] }`. همهٔ پله‌های آن قانون در یک تراکنش جایگزین می‌شوند. قبل و بعد در `FinanceAuditLog` ثبت و cache پاک می‌شود. |

- `quote` (`Back/src/property/roles/user/user.service.ts:1232`) الان `canceling_type: { id, title }` برمی‌گرداند (خط ۱۳۰۶). فیلد `tiers` هم به آن اضافه شود.
- serializer جزئیات آگهی (`Back/src/property/serializer/property.serializer.ts`) هم `canceling_type.tiers` را برگرداند تا Front درخواست جدا نزند.

---

## HW-1.3 — تابع خالص محاسبهٔ لغو

فایل `Back/src/wallet/cancellation-policy/compute-cancellation.ts` با تست کامل `*.spec.ts`:

```ts
type Tier = { min_hours_before: number; guest_refund_percent: number };

computeCancellation(input: {
  tiers: Tier[];          // from the reserve's financial snapshot, not the live table (D7)
  checkInAt: Date;        // check_in date at the listing's check_in_hour (14:00 if empty), Tehran time
  now: Date;
  guestPaid: number;      // toman
  feePercent: number;     // 20, from the snapshot
}): {
  allowed: boolean;       // false once check-in time has passed
  hoursBefore: number;    // floored
  tier: Tier | null;
  refund: number;         // to the guest
  retained: number;       // guestPaid - refund
  hostAmount: number;     // Math.round(retained * (100 - feePercent) / 100)
  feeAmount: number;      // retained - hostAmount
  nextTierAt: Date | null // when the refund percent drops next, for the UI
}
```

- پله انتخابی، پله‌ای است با بیشترین `min_hours_before` که از `hoursBefore` بیشتر نباشد.
- `refund = Math.round(guestPaid * percent / 100)`.
- سهم جایاب طبق D5 از `retained` محاسبه می‌شود. اگر کارفرما تصمیم دیگری بگیرد، فقط همین تابع تغییر می‌کند.
- **تست‌ها:**
  - لبهٔ دقیق هر پله (۲۴ ساعت دقیق و ۲۳:۵۹)
  - بعد از ساعت ورود (`allowed = false`)
  - صددرصد و صفردرصد
  - گرد کردن (جمع `refund + hostAmount + feeAmount` همیشه برابر `guestPaid`)
  - `check_in_hour` خالی
  - مرز روز در منطقهٔ زمانی تهران

---

## HW-1.4 — ویرایش در Panel

- **صفحه:** `Panel/app/cancellation-policies/page.tsx`.
- **منو:** در گروه مالی `Panel/components/Sidebar/SidebarRowItems.tsx` با `key: "cancellation-policies"`.
- **محتوا:**
  - سه برگه (سهل‌گیرانه، متعادل و سخت‌گیرانه). هر برگه یک جدول پله با «حداقل ساعت قبل از ورود» و «درصد بازگشت به مهمان»، دکمهٔ افزودن و حذف ردیف، و «ذخیره».
  - پیش‌نمایش زیر جدول: «اگر مهمان ۱۴٬۰۰۰٬۰۰۰ تومان پرداخت کرده باشد»، با مبلغ بازگشت، سهم میزبان و سهم جایاب برای هر پله. محاسبه از همان قاعدهٔ HW-1.3 است و فقط برای نمایش است. در Panel یک نسخهٔ کوچک از همان تابع کافی است.
  - هشدار ثابت: «تغییر پله‌ها فقط روی رزروهایی اثر دارد که از این به بعد پرداخت می‌شوند. متن توضیح همین قانون در "محتوا › قوانین ملک" جداگانه ویرایش می‌شود و باید با این پله‌ها هماهنگ بماند.»
- خطاهای اعتبارسنجی HW-1.1 با پیام فارسی Back نمایش داده شوند.

---

## HW-1.5 — نمایش در Front

- **صفحهٔ آگهی:** `CancellationSummary.client.tsx`:
  - اگر `canceling_type.tiers` وجود دارد، خط زمانی از پله‌ها ساخته شود. مثلاً «تا ۵ روز قبل از ورود: ۱۰۰٪ بازگشت»، «تا ۲۴ ساعت قبل: ۵۰٪»، «کمتر از ۲۴ ساعت: بدون بازگشت». رنگ‌ها همان `TIMELINE_COLORS` فعلی باشند.
  - بلوک اول متن CMS (`description` در `parseCancellationPolicy`) به‌عنوان توضیح بالای خط زمانی می‌ماند.
  - اگر `tiers` نبود، رفتار فعلی بدون تغییر اجرا شود.
- **مرحلهٔ قوانین مالک:** `Front/components/modules/OwnerPropertyEditor/PropertyTermsStep.client.tsx`. زیر هر گزینهٔ قانون کنسلی، پله‌های همان قانون با `GET /cancellation-policies` نمایش داده شوند تا میزبان بداند سهمش در لغو چطور محاسبه می‌شود. متن: «قانونی که انتخاب می‌کنید سهم شما را در لغو رزروهای جایاب تعیین می‌کند.»
- **sheet ثبت درخواست** (RS-4.5): نام قانون و پلهٔ اول.
- **ساعت‌ها:** به روز و ساعت ترجمه شوند (۱۲۰ ساعت = «۵ روز»). کلیدهای متن در namespace موجود `property` در `Front/messages/{fa,ar,en}.json` قرار بگیرند.

---

## معیار پذیرش فاز

- [ ] سه قانون با پله‌های HW-0.2 در دیتابیس هستند. ذخیرهٔ پله‌های نامعتبر (بدون صفر، درصد صعودی با کاهش ساعت) با پیام فارسی رد می‌شود.
- [ ] تغییر پله در Panel در `FinanceAuditLog` قبل و بعد را دارد و صفحهٔ آگهی بعد از پاک شدن cache پله‌های جدید را نمایش می‌دهد.
- [ ] همهٔ تست‌های `computeCancellation` پاس می‌شوند.
- [ ] صفحهٔ آگهی در سه زبان خط زمانی عددی را درست نمایش می‌دهد.
- [ ] Back، Panel و Front: lint و build یا test. سپس `/security-review`.
