# ۰۳ — کارت هدیه (Back + Panel + Front)

**وابستگی:** OW-01 (حساب `USER_GIFT`). **اولین فروش واقعی بعد از OW-02**، تا اعتبار قابل خرج باشد.
**خروجی:**
- صدور دسته‌ای کارت با پنج مبلغ ثابت
- خروجی یک‌بارهٔ کدها برای چاپ
- فروش کارت (با تخفیف اختیاری، مثلاً ۱۲٪ برای سازمان‌ها)، فاکتور رسمی، و فعال شدن کارت‌ها بعد از تأیید واریز
- غیرفعال کردن کارت گم‌شده
- صفحهٔ واردکردن کد ۱۶ رقمی برای هر کاربر
- دو انقضا: مهلت یک سالهٔ واردکردن کد و انقضای یک سالهٔ اعتبار بعد از ورود
- KPIهای کارت هدیه در پنل کارشناس

**تصمیم‌های کارفرما:**
- کارت فیزیکی است و دستی تحویل می‌شود. پنج نوع است: ۱، ۳، ۵، ۷ و ۱۰ میلیون.
- هر کاربری کد ۱۶ رقمی را وارد کند، مبلغ به کیف پول شمارهٔ او می‌نشیند. ربطی به سازمان ندارد و هر کسی می‌تواند کارت را به هر کسی بدهد.
- فقط روی آگهی‌های احرازشدهٔ گروه کمیسیونی خرج می‌شود، قابل نقد شدن نیست و فقط برای رزرو است.
- کد باید ظرف یک سال وارد شود، وگرنه می‌سوزد. از لحظهٔ ورود کد، شمارندهٔ یک ساله فعال می‌شود.

---

## OW-3.1 — مدل

```prisma
model GiftCardBatch {
  id            Int        @id @default(autoincrement())
  title         String                              // e.g. "چاپ آبان ۱۴۰۵ — ۵ میلیونی"
  amount        Int                                 // one of GIFT_CARD_DENOMINATIONS
  count         Int
  created_by    Int
  exported_at   DateTime?                           // codes can be exported once
  exported_by   Int?
  created_at    DateTime   @default(now())
  cards         GiftCard[]
  @@map("gift_card_batches")
}

model GiftCard {
  id                  Int       @id @default(autoincrement())
  batch_id            Int
  serial              String    @unique @db.VarChar(16)  // GC-1405-000001, printed in clear
  code_hash           String    @unique @db.VarChar(64)  // HMAC-SHA256(code, GIFT_CODE_PEPPER)
  code_last4          String    @db.VarChar(4)           // for support lookups
  amount              Int
  status              Int       @db.SmallInt             // 10 INACTIVE (printed stock), 20 ON_SALE, 30 REDEEMED, 40 EXPIRED, 50 DISABLED
  sale_id             Int?                               // GiftCardSale that sold this card
  discount_amount     Int       @default(0)              // this card's share of the sale discount (12% of 5M = 600,000)
  activated_at        DateTime?                          // on sale: after the sale is paid
  redeem_deadline     DateTime?                          // activated_at + 1 year
  redeemed_at         DateTime?
  redeemed_by_user_id Int?
  lot_id              Int?                               // the USER_GIFT lot created on redeem
  disabled_reason     String?
  created_at          DateTime  @default(now())
  batch               GiftCardBatch @relation(fields: [batch_id], references: [id])
  @@index([status, redeem_deadline])
  @@map("gift_cards")
}

model GiftCardSale {                                     // one sale of one or more physical cards
  id               Int       @id @default(autoincrement())
  number           String    @unique @db.VarChar(20)    // SALE-1405-000045 (InvoiceCounter, OW-6.1)
  buyer_type       String    @db.VarChar(8)             // ORG | PERSON
  organization_id  Int?                                 // when the buyer is a registered organization
  buyer            Json                                 // legal or personal details for the invoice
  card_count       Int
  face_total       Int                                  // sum of card amounts, e.g. 10 × 5M = 50M
  discount_percent Int       @db.SmallInt               // e.g. 12
  discount_total   Int                                  // 6M
  vat_percent      Int       @db.SmallInt
  vat_amount       Int
  payable_total    Int                                  // 44M + VAT
  status           Int       @db.SmallInt               // 10 AWAITING_PAYMENT, 20 PAID, 30 CANCELED
  pay_method       String    @db.VarChar(16)            // BANK_TRANSFER | CASH_POS (recorded by staff)
  transfer_tracking String?  @db.VarChar(64)
  transfer_receipt_id Int?
  reviewed_by      Int?
  confirmed_by     Int?
  invoice_id       Int?      @unique
  created_by       Int
  created_at       DateTime  @default(now())
  paid_at          DateTime?
  @@map("gift_card_sales")
}

model GiftCardRedeemAttempt {                            // brute-force guard (E14)
  id         Int      @id @default(autoincrement())
  user_id    Int
  ip         String   @db.VarChar(45)
  success    Boolean
  created_at DateTime @default(now())
  @@index([user_id, created_at])
  @@index([ip, created_at])
  @@map("gift_card_redeem_attempts")
}
```

- **کد:** ۱۶ رقم از `crypto.randomInt`، نه `Math.random`، و در پایگاه داده **هرگز** به‌صورت خام ذخیره نمی‌شود. تکرار `code_hash` در هنگام ساخت دوباره تولید می‌شود.
- **سریال:** سال جلالی و شمارهٔ ترتیبی سراسری.

---

## OW-3.2 — صدور دسته‌ای (Back + Panel)

| متد | مسیر (ماژول `gift-cards`) | کار |
| --- | --- | --- |
| GET | `/admin/gift-cards/summary` | KPIها: تعداد صادرشده، در فروش، واردشده، منقضی و غیرفعال، ارزش کل فروخته‌شده، ارزش واردشده، و ماندهٔ اعتبار هدیه در کیف پول‌ها |
| GET | `/admin/gift-cards?status=&amount=&q=` | فهرست. `q` روی سریال، چهار رقم آخر کد و موبایل واردکننده جستجو می‌کند. |
| POST | `/admin/gift-cards/batches` | بدنه `{ title, amount, count }`. `amount` باید در `GIFT_CARD_DENOMINATIONS` باشد و `count ≤ 5000`. کارت‌ها با `INACTIVE` ساخته می‌شوند. |

ساخت ۵۰۰۰ کارت در یک تراکنش با `createMany` دسته‌های ۵۰۰تایی انجام می‌شود. HMAC برای هر کد در حافظه ساخته می‌شود و کد خام فقط تا پایان همین درخواست در حافظه می‌ماند (OW-3.3).

## OW-3.3 — خروجی یک‌بارهٔ کدها برای چاپ

کدهای خام **فقط یک بار** قابل دیدن هستند. دو روش مجاز است:
- **(الف، پیشنهادی)** فایل Excel (`exceljs`) با ستون‌های سریال، کد و مبلغ همان لحظهٔ ساخت دسته در پاسخ `POST batches` به‌صورت دانلود برمی‌گردد.
- **(ب)** کد خام با `seal` (HW-2.7) موقتاً ذخیره شود و با `POST /admin/gift-cards/batches/:id/export` فقط یک بار دانلود شود. بعد از آن `exported_at` پر و کد sealed پاک می‌شود.

در هر دو روش:
- لاگ ممیزی `GIFT_CODES_EXPORTED` با ادمین و تعداد ثبت می‌شود.
- `transform.interceptor` بدنهٔ پاسخ را ذخیره نمی‌کند، چون فقط body درخواست را ذخیره می‌کند. کد در هیچ لاگ برنامه چاپ نمی‌شود.

## OW-3.4 — فروش کارت (با تخفیف)، فعال‌سازی و غیرفعال کردن

**مثال کارفرما (روش دوم هدیهٔ سازمانی):** شرکتی ۱۰ کارت هدیهٔ ۵ میلیونی فیزیکی می‌خرد و ۱۲٪ تخفیف می‌گیرد، پس به جای ۵۰ میلیون، ۴۴ میلیون می‌پردازد. کارت‌ها همان کارت‌های عادی‌اند و هر کسی کد را وارد کند، ۵ میلیون می‌گیرد. خریدار می‌تواند سازمان ثبت‌شده، سازمان ثبت‌نشده یا یک شخص باشد.

| متد | مسیر (ماژول `gift-cards`) | کار |
| --- | --- | --- |
| POST | `/admin/gift-cards/sales` | بدنه `{ buyer_type, organization_id?, buyer, serials: [] │ { serial_from, serial_to }, discount_percent, pay_method }`. همهٔ کارت‌ها باید `INACTIVE` باشند. `face_total`، `discount_total` (هر کارت `discount_amount = round(amount × p / 100)`)، مالیات و `payable_total` محاسبه و پیش‌فاکتور نمایش داده می‌شود. کارت‌ها به فروش وصل ولی هنوز **غیرفعال** می‌مانند. |
| POST | `/admin/gift-cards/sales/:id/transfer` | ثبت شمارهٔ پیگیری، تاریخ و رسید. فروش وارد صف `org-payments` (OW-6.3) می‌شود. |
| POST | `/admin/gift-cards/sales/:id/cancel` | قبل از پرداخت. کارت‌ها از فروش جدا می‌شوند. |
| POST | `/admin/gift-cards/disable` | بدنه `{ serials: [], reason }`. فقط `INACTIVE` و `ON_SALE`. کارت واردشده قابل غیرفعال کردن نیست. |

- **بعد از تأیید دو نفرهٔ واریز در `org-payments`** (همان صف و قاعدهٔ OW-6.3)، `GiftCardSaleService.markPaid` در یک تراکنش:
  - فروش `PAID` می‌شود و `Invoice` با `kind = GIFT_CARD_SALE` و شمارهٔ `JY-…` ساخته می‌شود. سطرها: «کارت هدیهٔ سفر {مبلغ} — {تعداد} عدد»، تخفیف {p}٪، مالیات و جمع.
  - همهٔ کارت‌های فروش `ON_SALE` می‌شوند، با `activated_at = now` و `redeem_deadline = now + 1 year`.
  - اگر خریدار سازمان ثبت‌شده است، فاکتور در «فاکتورها»ی پنل همان سازمان دیده می‌شود (OW-6.5).
- **تخفیف برای حسابداری:** هنگام واردکردن کد (OW-3.5)، `discount_amount` کارت به‌عنوان `bonus_amount` روی lot کارت هدیه ثبت می‌شود. یعنی از ۵ میلیون اعتبار، ۶۰۰ هزار تومان تخفیف جایاب و ۴٫۴ میلیون پول واقعی است. گزارش HW-7.2 هر خرج را به همین نسبت تقسیم می‌کند، مثل شارژ سازمانی.
- **پیش‌فرض تخفیف:** صفر برای خریدار عادی. دکمه‌های سریع ۵، ۱۰، ۱۲ و ۱۵٪ و فیلد دلخواه ۰ تا ۵۰. برای سازمان ثبت‌شده، یک فیلد `gift_card_discount_percent` روی `Organization` (OW-4.1) پیشنهاد اولیه را می‌دهد.
- **چرا فعال‌سازی بعد از پرداخت:** کارت چاپی تا فروش و تأیید واریز قابل واردکردن نیست. کارت دزدیده‌شده از انبار یا فروش پرداخت‌نشده ارزشی ندارد، و مهلت یک سالهٔ کارفرما از لحظهٔ فروش شروع می‌شود.
- **فروش حضوری با کارتخوان (`CASH_POS`):** کارشناس رسید کارتخوان را آپلود می‌کند و همان تأیید دو نفره لازم است.

**صفحه‌های Panel** (`Panel/app/gift-cards/`):
- **صفحهٔ اصلی:** KPIها (تصویر ۳)، فهرست با فیلتر مبلغ و وضعیت، و دکمه‌های «صدور دستهٔ جدید»، «ثبت فروش» و «غیرفعال کردن».
- **صدور:** modal با انتخاب مبلغ از پنج گزینه، تعداد و عنوان، و هشدار «کدها فقط یک بار دانلود می‌شوند».
- **ثبت فروش:** `Panel/app/gift-cards/sales/` با فهرست فروش‌ها و وضعیت پرداخت. modal فروش شامل خریدار (انتخاب سازمان ثبت‌شده یا ورود اطلاعات حقوقی یا شخصی)، بازهٔ سریال یا اسکن سریال‌ها، درصد تخفیف، و پیش‌نمایش «۱۰ کارت ۵ میلیونی = ۵۰٬۰۰۰٬۰۰۰، تخفیف ۱۲٪ = ۶٬۰۰۰٬۰۰۰، قابل پرداخت ۴۴٬۰۰۰٬۰۰۰ + مالیات» است. پیش‌فاکتور و فاکتور با همان صفحهٔ چاپی OW-6.5 نمایش داده می‌شوند.
- **جزئیات کارت:** پیش‌نمایش کارت (تصویر ۳)، تاریخچهٔ وضعیت، واردکننده و موجودی lot آن.
- **زبان و تم:** متن‌ها در namespace `giftCards` در سه زبان (XC-5)، و تم روشن و تاریک.

---

## OW-3.5 — واردکردن کد (Back)

`POST /api/v1/gift-cards/redeem` با گارد `UserJwtGuard` و بدنهٔ `{ code: string }`. هر کاربر واردشده‌ای، مهمان یا میزبان، می‌تواند کد وارد کند.

1. `GIFT_CARDS_ENABLED = 1`.
2. **محدودیت:** بیش از ۵ تلاش ناموفق در یک ساعت برای همین کاربر یا همین IP → 429 با کد `GIFT_TOO_MANY_ATTEMPTS`. هر تلاش در `GiftCardRedeemAttempt` ثبت می‌شود.
3. ارقام فارسی و عربی نرمال و فاصله‌ها حذف شوند. اگر ۱۶ رقم نبود → 422 با `GIFT_CODE_INVALID`.
4. `code_hash` با `GIFT_CODE_PEPPER` محاسبه و کارت پیدا شود. نتیجه:
   - کارت نیست → `GIFT_CODE_INVALID`
   - `INACTIVE` یا `DISABLED` → `GIFT_CODE_INVALID`. پیام یکسان است تا وضعیت کارت لو نرود.
   - `REDEEMED` → `GIFT_ALREADY_USED`
   - `ON_SALE` با `redeem_deadline < now` → `GIFT_EXPIRED`
5. **در تراکنش با قفل ردیف کارت** (`SELECT … FOR UPDATE`):
   - `status = REDEEMED`، `redeemed_at` و `redeemed_by_user_id`
   - `addLot(USER_GIFT, source = GIFT_CARD, amount = card.amount, bonus_amount = card.discount_amount, expiresAt = now + 1 year, ref = GiftCard)` و `move(null → AVAILABLE)` با کلید `gift:{cardId}:redeem`
   - `card.lot_id`
6. بعد از commit: پیامک `GIFT_REDEEMED` با تاریخ انقضا به زبان کاربر، و اعلان داخل اپ.

**cron سوختن کارت:** در همان cron ساعتی HW-2.6، کارت‌های `ON_SALE` با `redeem_deadline < now` به `EXPIRED` می‌روند. کارت واردشده انقضای خودش را از lot می‌گیرد (HW-2.6).

## OW-3.6 — صفحهٔ واردکردن کد (Front)

- **مسیر:** `Front/app/(pages)/gift/page.tsx` (آدرس کوتاه روی کارت: `jayab.app/gift`).
  - کاربر واردنشده به ورود با `redirect_url=/gift` هدایت می‌شود.
  - همین فرم به‌صورت sheet از صفحهٔ کیف پول (OW-1.4) هم باز می‌شود.
- **فرم:**
  - ورودی ۱۶ رقمی در چهار گروه چهارتایی، `dir="ltr"`، `inputmode="numeric"`، با قبول ارقام فارسی و عربی و paste کل کد.
  - دکمهٔ «ثبت کارت هدیه».
- **موفقیت:** «{مبلغ} تومان به کیف پول جایاب شما اضافه شد. قابل استفاده تا {تاریخ}، فقط برای رزرو اقامتگاه‌های احرازشدهٔ رزرو با جایاب.» و دکمه‌های «جستجوی اقامتگاه» و «کیف پول من».
- **خطاها:** از `apiErrors` (XC-2):
  - `GIFT_CODE_INVALID`: «کد کارت معتبر نیست. ارقام را دوباره بررسی کنید.»
  - `GIFT_ALREADY_USED`
  - `GIFT_EXPIRED`: «مهلت یک سالهٔ ثبت این کارت تمام شده است.»
  - `GIFT_TOO_MANY_ATTEMPTS`: «تلاش‌های ناموفق زیاد بود. یک ساعت دیگر دوباره امتحان کنید.»
- **سه زبان و دو تم:** namespace `giftCard` (XC-4). صفحه `robots: noindex` دارد.

---

## معیار پذیرش فاز

- [ ] دستهٔ ۱۰۰تایی ۵ میلیونی ساخته می‌شود. کدها فقط یک بار دانلود می‌شوند و در پایگاه داده فقط hash و چهار رقم آخر وجود دارد.
- [ ] کارت `INACTIVE` قابل واردکردن نیست. فروش ۱۰ کارت ۵ میلیونی با ۱۲٪ تخفیف → پیش‌فاکتور ۴۴ میلیون (به‌اضافهٔ مالیات). بعد از تأیید دو نفرهٔ واریز، کارت‌ها فعال می‌شوند و فاکتور `JY-…` صادر می‌شود. واردکردن کد یک lot پنج میلیونی با `bonus_amount = 600,000` و انقضای یک سال بعد می‌سازد.
- [ ] ورود دوبارهٔ همان کد → «قبلاً استفاده شده». کارت `ON_SALE` بعد از یک سال بدون ورود → `EXPIRED`.
- [ ] شش تلاش ناموفق در یک ساعت → 429.
- [ ] اعتبار کارت فقط روی آگهی احرازشدهٔ رزرو با جایاب خرج می‌شود (OW-02).
- [ ] صفحهٔ `/gift` و صفحه‌های Panel در سه زبان و دو تم (XC-7). سپس `/security-review` (brute force، نشت کد، قفل ردیف).
