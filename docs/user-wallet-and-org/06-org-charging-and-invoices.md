# ۰۶ — شارژ سازمانی، پرداخت و فاکتور رسمی (Back + Front + Panel)

**وابستگی:** OW-05 (کارکنان)، OW-01 (حساب `EMPLOYEE_ORG_CREDIT`) و HW-05 (الگوی تأیید دو نفرهٔ مالی).
**خروجی:**
- سفارش شارژ (پیش‌فاکتور قابل ویرایش)
- محاسبهٔ تخفیف سازمانی
- پرداخت با درگاه یا با فاکتور رسمی و واریز بانکی
- تأیید واحد مالی
- شارژ کیف پول کارکنان با انقضای یک ساله
- فاکتور رسمی با شمارهٔ ترتیبی (مشترک با فروش کارت هدیه، OW-3.4)
- تاریخچهٔ پرداخت‌ها و خروجی برای سامانهٔ مودیان

**مثال کارفرما (روش اول):** شرکتی ۱۰ کارمند دارد و می‌خواهد به هر نفر ۵ میلیون بدهد. ۵۰ میلیون می‌پردازد و با توافق ۲۰٪، کیف پول هر کارمند ۶ میلیون شارژ می‌شود. یعنی ۱ میلیون جایزهٔ جایاب برای هر نفر. روش دوم (خرید کارت هدیه با تخفیف) در OW-3.4 است.

---

## OW-6.1 — مدل

```prisma
model OrganizationCharge {
  id               Int       @id @default(autoincrement())
  number           String    @unique @db.VarChar(20)   // ORD-1405-000123
  organization_id  Int
  status           Int       @db.SmallInt             // 10 DRAFT, 20 AWAITING_PAYMENT, 30 PAID, 40 CANCELED, 50 EXPIRED
  discount_percent Int       @db.SmallInt             // snapshot from the organization at submit (E5)
  paid_total       Int                                // what the org pays before VAT
  bonus_total      Int                                // Jayab's organizational discount added to wallets
  credit_total     Int                                // paid_total + bonus_total
  vat_percent      Int       @db.SmallInt
  vat_amount       Int
  payable_total    Int                                // paid_total + vat_amount
  pay_method       String?   @db.VarChar(16)          // GATEWAY | BANK_TRANSFER
  payment_id       Int?      @unique
  transfer_tracking String?  @db.VarChar(64)
  transfer_receipt_id Int?                            // private attachment uploaded by the manager
  transfer_paid_on DateTime? @db.Date
  reviewed_by      Int?                               // finance step 1 (HW-5.4 two-person rule)
  confirmed_by     Int?                               // finance step 2
  reject_reason    String?
  invoice_id       Int?      @unique
  submitted_by     Int?                               // manager user id
  submitted_at     DateTime?
  paid_at          DateTime?
  created_by       Int
  created_at       DateTime  @default(now())
  updated_at       DateTime  @updatedAt
  items            OrganizationChargeItem[]
  @@index([organization_id, status])
  @@map("organization_charges")
}

model OrganizationChargeItem {
  id           Int  @id @default(autoincrement())
  charge_id    Int
  employee_id  Int
  paid_amount  Int                                    // e.g. 5,000,000
  bonus_amount Int                                    // e.g. 1,000,000 at 20%
  lot_id       Int?                                   // the EMPLOYEE_ORG_CREDIT lot created when paid
  charge       OrganizationCharge @relation(fields: [charge_id], references: [id], onDelete: Cascade)
  @@unique([charge_id, employee_id])
  @@map("organization_charge_items")
}

model Invoice {                                       // official invoice, shared by org charges and gift-card sales
  id            Int       @id @default(autoincrement())
  number        String    @unique @db.VarChar(20)     // JY-1405-000123, assigned when the invoice is issued
  kind          String    @db.VarChar(16)             // ORG_CHARGE | GIFT_CARD_SALE
  organization_id Int?
  seller        Json                                  // JAYAB_LEGAL_INFO snapshot
  buyer         Json                                  // legal name, national id, economic code, registration no, address, postal code, phone
  lines         Json                                  // [{ title_key, qty, unit_price, discount, total }]
  subtotal      Int
  discount      Int
  vat_percent   Int       @db.SmallInt
  vat_amount    Int
  total         Int
  notes         Json?                                 // e.g. { org_bonus_total } shown as an information line
  status        Int       @db.SmallInt                // 20 ISSUED, 30 PAID, 40 CANCELED
  issued_at     DateTime
  paid_at       DateTime?
  created_at    DateTime  @default(now())
  @@index([organization_id])
  @@map("invoices")
}

model InvoiceCounter {                                // one row per prefix and Jalali year
  key  String @id @db.VarChar(16)                     // "JY-1405" | "ORD-1405" | "SALE-1405"
  last Int    @default(0)
  @@map("invoice_counters")
}
```

**محاسبه** (تابع خالص `priceOrgCharge(items, discountPercent, vatPercent)` با تست):
- `bonus_amount = Math.round(paid_amount × discountPercent / 100)`
- `credit = paid_amount + bonus_amount`
- `vat_amount = Math.round(paid_total × vatPercent / 100)`
- `payable_total = paid_total + vat_amount`
- مالیات روی مبلغ پرداختی است، نه اعتبار. باید با مشاور مالیاتی تأیید شود (OW-0.2).

**شماره‌ها:** با `UPDATE invoice_counters SET last = last + 1 … RETURNING` داخل همان تراکنش ساخته می‌شوند تا شماره‌ها پشت سر هم و بدون فاصله و تکرار باشند. پیشوند سفارش `ORD-`، فاکتور `JY-` و فروش کارت `SALE-` است و هر کدام کلید جدا در جدول دارند.

---

## OW-6.2 — سفارش شارژ (پنل سازمان)

| متد | مسیر (`OrgManagerGuard`) | کار |
| --- | --- | --- |
| POST | `/org/:orgId/charges` | ساخت پیش‌نویس |
| PUT | `/org/:orgId/charges/:id/items` | بدنه `{ items: [{ employee_id, paid_amount }] }` یا `{ selection: { department?, status: ACTIVE, ids? }, paid_amount }` برای مبلغ یکسان یک گروه. فقط در `DRAFT`. حداقل هر نفر ۱۰۰٬۰۰۰ تومان. فقط کارمند `ACTIVE`. |
| GET | `/org/:orgId/charges/:id` | سفارش با ردیف‌ها و `priceOrgCharge` |
| POST | `/org/:orgId/charges/:id/submit` | `DRAFT → AWAITING_PAYMENT`. snapshot `discount_percent` و `vat_percent`، ساخت **پیش‌فاکتور** (فقط نمایش با شمارهٔ سفارش) و پیامک به مدیر. |
| POST | `/org/:orgId/charges/:id/cancel` | از `DRAFT` یا `AWAITING_PAYMENT` بدون پرداخت تأییدشده |
| POST | `/org/:orgId/charges/:id/pay` | فقط اگر `payable_total ≤ ORG_GATEWAY_MAX_AMOUNT`. پرداخت با `PaymentUserService.create(..., TurnoverType.PAY_ORG_CHARGE)` (نوع جدید در enum) ← `{ payment_url }` |
| POST | `/org/:orgId/charges/:id/transfer` | بدنه `{ tracking_code, paid_on, receipt_id }` برای واریز بانکی. رسید با آپلود خصوصی. سفارش در صف تأیید مالی قرار می‌گیرد. |
| GET | `/org/:orgId/charges?status=` | تاریخچهٔ سفارش‌ها و فاکتورها |

- **قاعدهٔ ۱۵ تصویر ۱:** تا قبل از پرداخت نهایی، شماره‌ها و مبلغ‌ها قابل ویرایش‌اند. پس `items` فقط در `DRAFT` تغییر می‌کند. برای ویرایش سفارش ثبت‌شده، مدیر آن را «لغو» و یک سفارش جدید از روی آن کپی می‌کند (`POST charges/:id/duplicate`).
- سفارش `AWAITING_PAYMENT` بعد از ۳۰ روز بدون پرداخت با cron روزانه `EXPIRED` می‌شود.

## OW-6.3 — تأیید واریز بانکی (پنل مالی)

**ماژول `org-payments`** (Back: `admin/org-payments`، Panel: `Panel/app/org-payments/`، در گروه مالی HW-5.8):
- **صف:** سفارش‌های شارژ سازمانی و فروش‌های کارت هدیه (OW-3.4) که منتظر تأیید واریزند، با سازمان یا خریدار، مبلغ، شمارهٔ پیگیری، تاریخ و رسید (لینک موقت امضاشده).
- **دو مرحله (HW-5.4، D2):**
  1. حسابدار: «واریز در صورت‌حساب بانک دیده شد» (`reviewed_by`)
  2. تأییدکنندهٔ دیگر: «تأیید و شارژ» (`confirmed_by`). باید با `reviewed_by` متفاوت باشد.
  - «رد» با دلیل، پیامک به مدیر، و برگشت سفارش به `AWAITING_PAYMENT`.
- **متن‌ها:** namespace `finance` در سه زبان، و تم روشن و تاریک (XC-5).

## OW-6.4 — شارژ کیف پول کارکنان

با پرداخت موفق درگاه (`case PAY_ORG_CHARGE` در کال‌بک) یا تأیید مالی، `OrgChargeService.markPaid(chargeId, actor)`:

1. **در یک تراکنش:**
   - `AWAITING_PAYMENT → PAID`
   - ساخت `Invoice` با شمارهٔ `JY-…`، `seller` از `JAYAB_LEGAL_INFO` و `buyer` از اطلاعات حقوقی سازمان
     - سطر: «شارژ اعتبار سفر کارکنان — {n} نفر» به مبلغ `paid_total`
     - سطر اطلاعاتی: «اعتبار هدیهٔ سازمانی جایاب ({p}٪): {bonus_total} تومان»
     - مالیات و جمع
   - برای هر ردیف: حساب `EMPLOYEE_ORG_CREDIT` آن کارمند، `addLot(source = ORG_CHARGE, amount = credit, bonus_amount, expiresAt = now + 1 year, ref = item)` و `move(null → AVAILABLE)` با کلید `orgcharge:{itemId}`
   - لاگ ممیزی
   - برای ۱۰۰۰ ردیف، `createMany` در دسته‌های ۲۰۰تایی. دفترکل با قفل هر حساب کار می‌کند، و چون هر کارمند حساب خودش را دارد قفل‌ها با هم تداخل ندارند.
2. **بعد از commit:**
   - پیامک `ORG_EMPLOYEE_CREDIT` به همهٔ کارکنان از طریق یک job در صف Bull، در دسته‌های ۵۰تایی با فاصله، تا SMS.ir محدود نشود. زبان هر کارمند `user.locale` اوست، یا fa اگر هنوز وارد نشده.
   - پیامک `ORG_PAYMENT_CONFIRMED` به مدیر.
   - کلید یکتای هر ردیف تضمین می‌کند که کال‌بک یا تأیید دوباره، شارژ دوباره نمی‌سازد.

**قاعدهٔ ۱۶ تصویر ۱ (عدم بازپس‌گیری):** هیچ endpointی اعتبار را از کارمند برنمی‌دارد. انقضای یک ساله (HW-2.6) تنها راه خروج اعتبار خرج‌نشده است و بعد از آن، طبق تصمیم کارفرما، از بین می‌رود.

---

## OW-6.5 — صفحه‌های پنل سازمان (Front)

| مسیر | محتوا |
| --- | --- |
| `org/[orgId]/charge/page.tsx` | **ساخت سفارش** (بخش ۹ تصویر ۱ و ماشین‌حساب Artifact): انتخاب کارکنان از جدول با تیک، فیلتر بخش یا «همهٔ فیلترشده‌ها»، تعیین مبلغ گروهی و ویرایش مبلغ هر ردیف. جمع‌بندی زنده از سرور: تعداد، «مبلغ پرداختی شما»، «اعتبار هدیهٔ جایاب ({p}٪)»، «اعتبار هر کارمند»، مالیات و قابل پرداخت. دکمه‌های «ذخیرهٔ پیش‌نویس» و «ثبت و صدور پیش‌فاکتور». |
| `org/[orgId]/charges/[id]/page.tsx` | وضعیت سفارش و دو گزینهٔ پرداخت: **درگاه** (فقط زیر سقف، با توضیح سقف) و **واریز بانکی با فاکتور** (شبا و شمارهٔ حساب جایاب، فرم شمارهٔ پیگیری، تاریخ و آپلود رسید). بعد از ارسال: «در انتظار تأیید واحد مالی». |
| `org/[orgId]/invoices/page.tsx` | فهرست پیش‌فاکتورها و فاکتورها با وضعیت، شامل فاکتور فروش کارت هدیه به همین سازمان (OW-3.4) |
| `org/[orgId]/invoices/[id]/page.tsx` | **فاکتور قابل چاپ** با CSS چاپ A4 و دکمهٔ «چاپ». نسخهٔ رسمی فارسی است. در ar و en همان صفحه ترجمه با برچسب «ترجمه — نسخهٔ رسمی فارسی است» نمایش داده می‌شود (XC-6). شامل فروشنده و خریدار، سطرها، مالیات، جمع به عدد و حروف فارسی (`Num2Persian` موجود در `Front/helpers/`)، شمارهٔ قرارداد اگر هست، و جای مهر و امضا. |

**متن‌ها:** همه در namespace `org` در سه زبان و دو تم. تمام مبلغ‌ها با `formatTomanAmount`.

## OW-6.6 — نمای کارشناس (Panel)

برگهٔ «اعتبارات» در جزئیات سازمان (OW-4.3): فهرست سفارش‌ها، فاکتورها، وضعیت پرداخت و جمع‌ها. کارشناس فروش امکان تأیید پرداخت ندارد، چون این کار فقط با `org-payments` ممکن است.

## OW-6.7 — خروجی مودیان

`GET /admin/org-payments/invoices/export?from=&to=` فایل Excel فاکتورهای `PAID` بازه را با ستون‌های لازم برای ثبت دستی در سامانهٔ مودیان می‌سازد. ستون‌ها با تأیید OW-0.2 نهایی شوند. اتصال مستقیم به سامانهٔ مودیان در این بسته نیست.

---

## معیار پذیرش فاز

- [ ] مثال کارفرما: ۱۰ کارمند × ۵ میلیون با ۲۰٪ → پرداخت ۵۰ میلیون (به‌اضافهٔ مالیات تنظیم‌شده)، و ۱۰ lot شش میلیونی با `bonus_amount = 1M` و انقضای یک سال بعد.
- [ ] مثال ۱۰۰ نفر: ۱۰ × ۱۰ میلیون و ۹۰ × ۵ میلیون، با جمع درست. ویرایش بعد از ثبت ممکن نیست و کپی سفارش کار می‌کند.
- [ ] مبلغ بالای سقف فقط گزینهٔ واریز بانکی دارد. تأیید دو نفره انجام می‌شود و همان نفر دو مرحله را نمی‌تواند تأیید کند.
- [ ] تأیید دوباره یا کال‌بک دوباره شارژ تکراری نمی‌سازد. شمارهٔ فاکتورها پشت سر هم است.
- [ ] پیامک ۱۰۰ کارمند در صف و به زبان هر نفر فرستاده می‌شود.
- [ ] فاکتور در سه زبان و دو تم نمایش داده می‌شود و چاپ فارسی آن یک صفحهٔ A4 است.
- [ ] Back، Front و Panel: lint، build و test. سپس `/security-review`.
