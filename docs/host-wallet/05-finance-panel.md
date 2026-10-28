# ۰۵ — پنل مالی و تسویهٔ دستی (Back + Panel)

**وابستگی:** HW-02 و HW-03. **پیش‌نیاز اولین تسویهٔ واقعی:** بله. نقش‌های HW-0.4 ساخته شده باشند.
**خروجی:** تأیید شبای میزبان، صف تسویهٔ روزانه، پنجرهٔ «ثبت تسویهٔ دستی»، تأیید یا رد بانکی، توقف و رفع توقف، و سابقهٔ مالی هر میزبان.

**مرزبندی (سند، بخش ۱۰):** پنل مالی از پنل پشتیبان جداست و پشتیبان حق تغییر مبالغ، شبا یا ثبت واریز ندارد. همهٔ APIها زیر `admin/host-bank-accounts` و `admin/settlements` هستند. RBAC بر اساس همین بخش اول مسیر کار می‌کند (`Back/src/common/interceptors/rbac.interceptor.ts:30-40`).

---

## HW-5.1 — ساختار (Back)

**پوشه‌ها:**
- `Back/src/wallet/roles/finance/bank-accounts.controller.ts` (مسیر `admin/host-bank-accounts`)
- `Back/src/wallet/roles/finance/settlements.controller.ts` (مسیر `admin/settlements`)
- سرویس‌های همان پوشه

گارد `AdminJwtGuard` است. هر تغییر یک ردیف `FinanceAuditLog` با `permission` برابر کلید ماژول و فعل RBAC (مثلاً `settlements:u`) می‌نویسد.

---

## HW-5.2 — تأیید شبا

| متد | مسیر | کار |
| --- | --- | --- |
| GET | `/admin/host-bank-accounts?status=` | لیست با نام میزبان، نام صاحب حساب، شبای ماسک‌شده، بانک، وضعیت، زمان ثبت یا تغییر، و پرچم «حواله‌های در جریان دارد» |
| GET | `/admin/host-bank-accounts/:id` | جزئیات با **شبای کامل** (فقط اینجا)، هویت احرازشدهٔ مالک (نام، کد ملی ماسک‌شده، وضعیت احراز) و سابقهٔ تغییرات از `FinanceAuditLog` |
| PATCH | `/admin/host-bank-accounts/:id/verify` | `status = VERIFIED`، `verified_by` و `verified_at` |
| PATCH | `/admin/host-bank-accounts/:id/reject` | بدنه `{ note }`. `status = NEEDS_FIX` و پیامک `WALLET_BANK_REJECTED`. |

- تطبیق نام دستی است (D4). Panel نام صاحب حساب و نام هویت احرازشده را کنار هم نمایش می‌دهد.
- دیدن شبای کامل یک لاگ ممیزی `IBAN_VIEWED` می‌نویسد.

---

## HW-5.3 — صف تسویه و ثبت حواله

**صف** `GET /admin/settlements/queue?tab=`:

| tab | ردیف‌ها |
| --- | --- |
| `available` (پیش‌فرض) | رزروهایی با موجودی `AVAILABLE`، گروه‌بندی‌شده به ازای میزبان |
| `processing` | حواله‌های `PROCESSING` |
| `on_hold` | رزروهایی با موجودی `ON_HOLD` |
| `pending` | رزروهایی با موجودی `PENDING`، فقط‌خواندنی، با تاریخ آزادسازی |

ستون‌ها طبق سند، بند ۱۰: میزبان، کد رزرو، اقامتگاه، مبلغ سهم میزبان، تاریخ مجاز تسویه، وضعیت رزرو (لغو یا قطعی)، توقف مالی، شبای تأییدشده (ماسک‌شده یا «تأیید نشده»)، مبلغ قابل پرداخت، پرداخت‌های قبلی و مانده. عملیات: مشاهدهٔ جزئیات، توقف و شروع تسویهٔ دستی.

**پنجرهٔ «ثبت تسویهٔ دستی»** (سند، بند ۱۱):

1. `GET /admin/settlements/prepare?host_user_id=` مبلغ‌های `AVAILABLE` هر رزرو، شبای تأییدشدهٔ **کامل**، بانک و `WALLET_SOURCE_ACCOUNTS` را برمی‌گرداند. حسابدار واریز را خارج از سامانه در بانک انجام می‌دهد.
2. `POST /admin/settlements` با بدنه:

```ts
{
  host_user_id: number,
  allocations: { reserve_id: number, amount: number }[],   // one or many reserves of this host (D3)
  amount: number,                                           // must equal the sum of allocations
  paid_on: string,                                          // ISO date
  source_account: string,                                   // a key from WALLET_SOURCE_ACCOUNTS
  tracking_code: string,
  receipt_id?: number,                                      // uploaded via admin attachments (HW-5.5)
  note?: string,
}
```

**داخل یک تراکنش با `pg_advisory_xact_lock(host_user_id)`:**
- شبای میزبان باید `VERIFIED` باشد، وگرنه 422 با کد `SETTLEMENT_BANK_NOT_VERIFIED` (سند، بند ۱۴).
- `amount = Σ allocations`.
- هر `allocation.amount` از موجودی `AVAILABLE` همان رزرو که **همان لحظه** از دفترکل محاسبه می‌شود بیشتر نباشد، وگرنه 409 با کد `SETTLEMENT_EXCEEDS_AVAILABLE`.
- رزرو `ON_HOLD` قابل تخصیص نیست.
- `Settlement` با `status = PROCESSING` و snapshot شبا (`iban_enc`، `iban_last4`) ساخته شود. سپس برای هر تخصیص `move(AVAILABLE → PROCESSING)` با کلید `settle:{sid}:{rid}:start`.
- `tracking_code` در بین حواله‌های غیر `FAILED` یکتا باشد، تا یک واریز دوبار ثبت نشود.

**«تسویهٔ مضاعف ممنوع»:** قفل میزبان، چک موجودی داخل همان تراکنش و کلید یکتای هر تخصیص با هم تضمین می‌کنند که دو حسابدار یا دو کلیک همزمان نتوانند بیشتر از مانده ثبت کنند. تست همزمانی با دو درخواست موازی نوشته شود.

---

## HW-5.4 — تأیید یا رد بانکی

| متد | مسیر | کار |
| --- | --- | --- |
| PATCH | `/admin/settlements/:id/confirm` | `PROCESSING → SETTLED` برای همهٔ تخصیص‌ها (کلید `settle:{sid}:{rid}:done`)، `status = SETTLED`، `confirmed_by` و `confirmed_at` |
| PATCH | `/admin/settlements/:id/fail` | بدنه `{ reason }`. `PROCESSING → AVAILABLE` (کلید `settle:{sid}:{rid}:fail`) و `status = FAILED`. حواله و ردیف‌هایش در سابقه می‌مانند. |

- **کنترل دو نفره (D2):** `confirm` و `fail` توسط `created_by` همان حواله رد می‌شوند (403، کد `SETTLEMENT_SAME_OPERATOR`).
- **تغییر شبا:** اگر `needs_recheck` حواله برقرار است (شبای میزبان بعد از ثبت حواله تغییر کرده، HW-3.1)، `confirm` تا وقتی تأییدکننده صریحاً `{ acknowledge_iban_change: true }` نفرستد رد می‌شود و این تأیید لاگ می‌شود.
- **بعد از confirm:** پیامک `WALLET_SETTLED` با مبلغ، کد رزروها و شمارهٔ پیگیری، و اعلان داخل اپ.

---

## HW-5.5 — رسید

- آپلود با `POST admin/attachments` موجود (`Back/src/attachment/attachment.controller.ts:182`).
- اگر بررسی HW-0.6 نشان داد فایل‌ها عمومی‌اند، رسیدها در یک مسیر خصوصی ذخیره شوند. نمایش آن‌ها (Panel و HW-4.1) فقط با لینک موقت امضاشده از `s3-manager` باشد. لینک مستقیم رسید هرگز در پاسخ API قرار نگیرد.

## HW-5.6 — توقف و رفع توقف

`PATCH /admin/settlements/reserves/:reserveId/hold` و `.../unhold` با بدنهٔ `{ reason }` که `WalletService.hold` و `unhold` (HW-2.4) را صدا می‌زنند. دلیل در صف و در جزئیات میزبان نمایش داده می‌شود. نمونه: «شکایت مهمان»، «اختلاف در تحویل اقامتگاه».

## HW-5.7 — سابقهٔ یک میزبان

`GET /admin/settlements/hosts/:userId` همهٔ snapshotها، ردیف‌های دفترکل، حواله‌ها با تخصیص‌ها و مانده‌ها را برمی‌گرداند. این صفحه پاسخ «از درگاه تا رسید» برای هر رزرو است (معیار تحویل سند).

---

## HW-5.8 — صفحه‌های Panel

**منو:** گروه جدید «مالی» در `Panel/components/Sidebar/SidebarRowItems.tsx` با چهار مورد، هر کدام با `key` برابر ماژول خودش:
- حساب‌های بانکی میزبان (`host-bank-accounts`)
- تسویهٔ میزبان (`settlements`)
- بازگشت وجه مهمان (`guest-refunds`، HW-06)
- قوانین کنسلی (`cancellation-policies`، HW-01)

**صفحه‌ها** (چیدمان در بخش «طراحی صفحه‌ها» [Artifact](https://claude.ai/artifact/A4SqQ8eT37zewT9yyspNMs)، با NextUI و ظاهر فعلی Panel):

| مسیر | محتوا |
| --- | --- |
| `Panel/app/host-bank-accounts/page.tsx` | جدول با فیلتر وضعیت |
| `Panel/app/host-bank-accounts/show/[id]/page.tsx` | نام‌ها کنار هم، شبای کامل با دکمهٔ کپی، سابقه، و دکمه‌های «تأیید» و «نیازمند اصلاح» با `ConfirmModal` و یادداشت اجباری |
| `Panel/app/settlements/page.tsx` | چهار برگهٔ صف. دکمهٔ «شروع تسویه» برای ردیف بدون شبای تأییدشده غیرفعال با tooltip «شبا تأیید نشده است». |
| پنجرهٔ ثبت تسویه (modal) | خلاصهٔ مبلغ قابل پرداخت، شبای کامل و بانک، تیک رزروهای این میزبان، فرم (مبلغ، تاریخ جلالی، حساب مبدأ، شمارهٔ پیگیری، فایل رسید، توضیح)، متن «ثبت فرم به معنی واریز موفق نیست» و دکمهٔ «ثبت حواله (در حال تسویه)» |
| `Panel/app/settlements/show/[id]/page.tsx` | جزئیات حواله، تخصیص‌ها، رسید، و دکمه‌های «تأیید واریز» و «واریز رد شد» (برای ثبت‌کننده غیرفعال) |
| `Panel/app/settlements/hosts/[userId]/page.tsx` | سابقهٔ میزبان (HW-5.7) |

اعداد با جداکنندهٔ هزارگان، تاریخ‌ها جلالی، و شبا و شمارهٔ پیگیری با `dir="ltr"` نمایش داده شوند.

ستون `needs_recheck` مدل `Settlement` در migration HW-2.1 آمده است.

---

## معیار پذیرش فاز

- [ ] حواله برای میزبان با شبای تأییدنشده در سرور رد می‌شود (نه فقط در UI).
- [ ] دو درخواست همزمان برای همان موجودی: فقط یکی ثبت می‌شود و دیگری 409 می‌گیرد.
- [ ] ثبت حواله، موجودی را «در حال تسویه» می‌کند. تأیید توسط نفر دوم «تسویه‌شده» می‌کند و پیامک می‌فرستد. تأیید توسط همان ثبت‌کننده رد می‌شود.
- [ ] رد واریز، مبلغ را به «قابل تسویه» برمی‌گرداند و حوالهٔ ناموفق در سابقه می‌ماند.
- [ ] تغییر شبا بعد از ثبت حواله، تأیید را تا اعلام صریح مسدود می‌کند.
- [ ] نقش پشتیبان به همهٔ مسیرهای `admin/settlements` و `admin/host-bank-accounts` خطای 403 می‌گیرد.
- [ ] Back: lint، test و tsc. Panel: lint و build. سپس `/security-review`.
