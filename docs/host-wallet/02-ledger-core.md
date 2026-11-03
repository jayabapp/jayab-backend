# ۰۲ — هستهٔ دفترکل مشترک (Back)

**وابستگی:** HW-01 (در همین release). **باید همزمان با RS-03 بستهٔ پشتیبانی merge شود**، چون `ReservePaymentService.onPaid` (RS-3.2) متد `recordReserveCredit` همین فاز را صدا می‌زند.
**خروجی:**
- migration کیف پول
- یک دفترکل **مشترک** برای همهٔ پول‌های جایاب (طلب میزبان، کیف پول شخصی، کارت هدیه و اعتبار سازمانی کارکنان)
- snapshot مالی رزرو و ثبت طلب میزبان
- آزادسازی، توقف و رفع توقف
- رمزنگاری شبا و لاگ ممیزی مالی

**نسخهٔ ۲ (بعد از جواب کارفرما دربارهٔ طرح سازمانی و کارت هدیه):** دفترکل از «فقط طلب میزبان» به «چند نوع حساب» عمومی شد. هر مبلغ ورودی یک «بسته» (lot) با منشأ و تاریخ انقضای خودش دارد. دلیلش این است که اعتبار کارت هدیه یک سال بعد از واردکردن کد و اعتبار سازمانی یک سال بعد از تخصیص منقضی می‌شوند، و هر خرج باید معلوم کند از کدام پول آمده است. منطق طلب میزبان تغییری نکرده است. فازهای مصرف‌کنندهٔ این دفترکل در [`Back/docs/user-wallet-and-org/`](../user-wallet-and-org/README.md) هستند.

---

## HW-2.1 — migration کیف پول

فایل: `Back/prisma/migrations/20261028130000_add_host_wallet/migration.sql`. ردیف ۱۶ در `Back/docs/NEW-APP-DEPLOYMENT.md`، بعد از `add_reserve_support`: «افزایشی؛ جدول‌های کیف پول، حساب بانکی، تسویه و بازگشت وجه؛ چهار تنظیم و چهار ماژول دسترسی درج می‌شود». جدول‌های سازمان و کارت هدیه در migration جدای بستهٔ `user-wallet-and-org` هستند.

```prisma
// CancellationPolicyTier — see HW-1.1

model WalletAccount {
  id              Int      @id @default(autoincrement())
  owner_key       String   @unique @db.VarChar(48)  // "HOST:user:12", "TOPUP:user:12", "GIFT:user:12", "EMP:emp:88"
  type            String   @db.VarChar(24)          // HOST_RECEIVABLE | USER_TOPUP | USER_GIFT | EMPLOYEE_ORG_CREDIT
  user_id         Int?
  organization_id Int?
  employee_id     Int?
  created_at      DateTime @default(now())
  @@index([user_id])
  @@index([organization_id])
  @@map("wallet_accounts")
}

model WalletLot {                                   // one incoming amount with its own origin and expiry
  id          Int       @id @default(autoincrement())
  account_id  Int
  source      String    @db.VarChar(16)            // HOST_SHARE | TOPUP | GIFT_CARD | ORG_CHARGE | REFUND
  reserve_id  Int?                                 // HOST_SHARE: the reservation
  ref_type    String?   @db.VarChar(24)            // Payment | GiftCard | OrganizationChargeItem | ReserveCancellation | WalletLot
  ref_id      Int?
  amount      Int
  bonus_amount Int      @default(0)                // ORG_CHARGE: Jayab's organizational discount inside `amount` (e.g. 2M of 12M)
  release_at  DateTime?                            // HOST_SHARE only: when this tranche becomes settleable (HW-2.5)
  stage_seq   Int?      @db.SmallInt               // HOST_SHARE only: 1..n for staged long stays, 1 otherwise
  expires_at  DateTime?                            // null = never
  created_at  DateTime  @default(now())
  @@index([account_id, expires_at])
  @@index([reserve_id])
  @@map("wallet_lots")
}

model WalletLedgerEntry {                           // insert-only
  id            Int      @id @default(autoincrement())
  event_key     String   @unique @db.VarChar(64)
  account_id    Int
  lot_id        Int
  from_bucket   String?  @db.VarChar(12)           // null = money enters the lot
  to_bucket     String   @db.VarChar(12)
  amount        Int                                // > 0
  reserve_id    Int?                               // a spend, refund or host credit tied to a reservation
  settlement_id Int?
  reason        String?
  admin_id      Int?
  created_at    DateTime @default(now())
  @@index([account_id, lot_id])
  @@index([reserve_id])
  @@index([settlement_id])
  @@map("wallet_ledger_entries")
}

model HostBankAccount {
  id             Int       @id @default(autoincrement())
  owner_id       Int       @unique
  user_id        Int
  holder_name    String
  iban_enc       String
  iban_last4     String    @db.VarChar(4)
  bank_code      String    @db.VarChar(3)
  account_no_enc String?
  status         Int       @db.SmallInt            // 10 PENDING_REVIEW, 20 VERIFIED, 30 NEEDS_FIX
  review_note    String?
  verified_by    Int?
  verified_at    DateTime?
  created_at     DateTime  @default(now())
  updated_at     DateTime  @updatedAt
  @@map("host_bank_accounts")
}

model ReserveFinancialSnapshot {                   // written once, inside the payment callback
  id              Int      @id @default(autoincrement())
  reserve_id      Int      @unique
  payment_id      Int      @unique
  host_user_id    Int
  guest_user_id   Int
  guest_paid      Int                             // full price = gateway + wallet
  paid_by_gateway Int
  paid_by_wallet  Int                             // detail is in the SPENT entries with this reserve_id
  fee_percent     Int      @db.SmallInt
  fee_amount      Int
  host_amount     Int
  canceling_type  String   @db.VarChar(8)
  cancel_tiers    Json
  check_in_at     DateTime                        // handover moment: check-in date + listing check_in_hour
  check_out_at    DateTime
  release_at      DateTime                        // first tranche (HW-2.5); later tranches are on the lots
  complaint_window_ends_at DateTime               // HW-09: last moment the guest can report a handover problem in the app
  stages          Int      @default(1) @db.SmallInt
  created_at      DateTime @default(now())
  @@index([host_user_id])
  @@index([release_at])
  @@map("reserve_financial_snapshots")
}

model Settlement {
  id               Int       @id @default(autoincrement())
  host_user_id     Int
  bank_account_id  Int
  iban_enc         String
  iban_last4       String    @db.VarChar(4)
  amount           Int
  source_account   String    @db.VarChar(64)
  paid_on          DateTime  @db.Date
  tracking_code    String    @db.VarChar(64)
  receipt_id       Int?
  note             String?
  status           Int       @db.SmallInt          // 10 PROCESSING, 20 SETTLED, 30 FAILED
  needs_recheck    Boolean   @default(false)
  failure_reason   String?
  created_by       Int
  confirmed_by     Int?
  confirmed_at     DateTime?
  created_at       DateTime  @default(now())
  allocations      SettlementAllocation[]
  @@index([host_user_id, status])
  @@map("settlements")
}

model SettlementAllocation {
  id            Int        @id @default(autoincrement())
  settlement_id Int
  reserve_id    Int
  amount        Int
  settlement    Settlement @relation(fields: [settlement_id], references: [id])
  @@unique([settlement_id, reserve_id])
  @@map("settlement_allocations")
}

model ReserveCancellation {
  id                  Int      @id @default(autoincrement())
  reserve_id          Int      @unique
  canceled_by         String   @db.VarChar(8)    // GUEST | HOST
  admin_id            Int?
  hours_before        Int
  refund_percent      Int      @db.SmallInt
  refund_amount       Int                         // total returned to the guest
  refund_to_wallet    Int                         // part returned to the same wallet sources (HW-6.6)
  refund_to_bank      Int                         // part returned through GuestRefund
  host_amount         Int
  fee_amount          Int
  created_at          DateTime @default(now())
  @@map("reserve_cancellations")
}

model GuestRefund {                               // bank refunds only; wallet parts never come here
  id             Int       @id @default(autoincrement())
  reserve_id     Int?
  payment_id     Int?
  guest_user_id  Int
  source         String    @db.VarChar(16)        // CANCEL | HOST_CANCEL | CONFLICT | ORPHAN_PAYMENT | TOPUP_REFUND
  amount         Int
  holder_name    String?
  iban_enc       String?
  iban_last4     String?   @db.VarChar(4)
  status         Int       @db.SmallInt           // 10 AWAITING_INFO, 20 READY, 30 PROCESSING, 40 REFUNDED, 50 FAILED
  source_account String?   @db.VarChar(64)
  paid_on        DateTime? @db.Date
  tracking_code  String?   @db.VarChar(64)
  receipt_id     Int?
  failure_reason String?
  created_by     Int?
  confirmed_by   Int?
  confirmed_at   DateTime?
  created_at     DateTime  @default(now())
  updated_at     DateTime  @updatedAt
  @@index([status])
  @@map("guest_refunds")
}

model FinanceAuditLog {
  id          Int      @id @default(autoincrement())
  actor_type  String   @db.VarChar(8)            // ADMIN | USER | SYSTEM
  actor_id    Int?
  action      String   @db.VarChar(48)
  entity      String   @db.VarChar(32)
  entity_id   Int
  permission  String?  @db.VarChar(48)
  data        Json?
  ip          String?  @db.VarChar(45)
  created_at  DateTime @default(now())
  @@index([entity, entity_id])
  @@map("finance_audit_logs")
}
```

**داده‌های همین migration:**

```sql
INSERT INTO "settings" ("title","key","value","min","max","data_type","sort_order","updated_at") VALUES
 ('قابل تسویه شدن سهم میزبان بعد از تحویل اقامتگاه (ساعت)', 'WALLET_RELEASE_HOURS_AFTER_CHECKIN', '24', 1, 168, 'NUMBER', 120, NOW()),
 ('تسویهٔ مرحله‌ای از اقامت چند شبه به بالا', 'WALLET_STAGED_MIN_NIGHTS', '7', 2, 60, 'NUMBER', 122, NOW()),
 ('تعداد شب هر مرحلهٔ تسویه', 'WALLET_STAGE_NIGHTS', '7', 1, 30, 'NUMBER', 123, NOW()),
 ('حساب‌های مبدأ تسویه (JSON: [{"key":"mellat-4421","title":"ملت · جاری ۴۴۲۱"}])', 'WALLET_SOURCE_ACCOUNTS', '[]', NULL, NULL, 'TEXT_AREA', 121, NOW())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "access_control_modules" ("key","name","updated_at") VALUES
 ('host-bank-accounts','حساب‌های بانکی میزبان', NOW()),
 ('settlements','تسویهٔ میزبان', NOW()),
 ('guest-refunds','بازگشت وجه مهمان', NOW()),
 ('cancellation-policies','قوانین کنسلی', NOW())
ON CONFLICT ("key") DO NOTHING;
```

مدل `HandoverComplaint` و ستون `PropertyReserve.guest_checked_in_at` هم در همین migration هستند (HW-9.1).

همین ردیف‌ها در `setting.seeder.ts` و `module.seeder.ts` هم اضافه شوند. migration روی هیچ سروری اجرا نمی‌شود.

**ستون موجودی وجود ندارد.** مانده همیشه از جمع ردیف‌ها محاسبه می‌شود (سند، بند ۱۴). هیچ متد update یا delete برای `WalletLedgerEntry` و `WalletLot` نوشته نمی‌شود.

---

## HW-2.2 — حساب‌ها و bucketها

| نوع حساب | صاحب | bucketها | انقضا |
| --- | --- | --- | --- |
| `HOST_RECEIVABLE` | کاربرِ مالک | `PENDING` ← `AVAILABLE` ← `PROCESSING` ← `SETTLED`، و `ON_HOLD` و `VOID` | ندارد. یک lot برای هر مرحلهٔ تسویهٔ هر رزرو (معمولاً یکی، HW-2.5). |
| `USER_TOPUP` | هر کاربر (مهمان یا میزبان) | `AVAILABLE`، `HELD`، `SPENT`، `VOID` | ندارد (OW-01) |
| `USER_GIFT` | کاربری که کد کارت را وارد کرده | `AVAILABLE`، `HELD`، `SPENT`، `EXPIRED` | یک سال بعد از واردکردن کد (OW-03) |
| `EMPLOYEE_ORG_CREDIT` | کارمند سازمان | `AVAILABLE`، `HELD`، `SPENT`، `EXPIRED` | یک سال بعد از شارژ (OW-06) |

- سازمان حساب جدا ندارد. «موجودی سازمان» در پنل سازمان جمع ماندهٔ حساب‌های `EMPLOYEE_ORG_CREDIT` کارکنان همان سازمان است.
- **سهم پاداش:** هر lot شارژ سازمانی `bonus_amount` دارد، مثلاً ۲ میلیون از ۱۲ میلیون. در گزارش، هر خرج از آن lot به همان نسبت به «پول واقعی سازمان» و «تخفیف جایاب» تقسیم می‌شود (HW-7.2).

- **`HELD`:** بخشی از کیف پول که برای یک پرداخت در جریان کنار گذاشته شده است (OW-02). با پرداخت موفق `SPENT` می‌شود و با شکست یا انقضا به `AVAILABLE` برمی‌گردد.
- حساب‌ها تنبل ساخته می‌شوند: اولین بار که لازم شدند، با `upsert` روی `owner_key`.

---

## HW-2.3 — سرویس دفترکل

**پوشه:** `Back/src/wallet/` با `wallet.module.ts`، `common/` و `services/wallet.service.ts`. `WalletModule` در `app.module.ts` ثبت می‌شود و `WalletService` را export می‌کند.

```ts
account(type, ref): Promise<WalletAccount>                         // upsert by owner_key
addLot(tx, { account, source, amount, bonusAmount?, expiresAt?, reserveId?, ref?, key, reason? }): Promise<WalletLot>
move(tx, { key, account, lot, from, to, amount, reserveId?, settlementId?, reason?, adminId? }): Promise<boolean>
lotBalances(lotId) / accountBalances(accountId) / reserveHostBalances(reserveId)

// host receivable (this package)
recordReserveCredit(reserve, payment, walletParts, tx)            // HW-2.4
release(reserveId, tx?) / hold(reserveId, reason, adminId) / unhold(...)
voidForCancellation(reserveId, amount, tx)

// spendable accounts (used by user-wallet-and-org)
spendable(userId, { mode, propertyId }): Promise<SpendPlan>        // OW-02
hold(tx, plan, reserveId) / capture(tx, reserveId) / releaseHold(tx, reserveId)
expireDueLots(batch)                                               // HW-2.6
```

- **`move` تنها راه نوشتن ردیف است:**
  - قبل از نوشتن `SELECT pg_advisory_xact_lock(account_id)` اجرا می‌شود. عملیاتی که چند حساب را درگیر می‌کند، قفل‌ها را به ترتیب صعودی `account_id` می‌گیرد تا بن‌بست پیش نیاید.
  - اگر `from` پر است، موجودی همان bucket در **همان lot** با جمع ردیف‌ها چک می‌شود.
  - `event_key` تکراری (P2002) مقدار `false` برمی‌گرداند و خطا نمی‌دهد. این همان «پاسخ تکراری درگاه بدون دوباره‌شماری» است.
- **محاسبهٔ مانده:** `groupBy` روی `to_bucket` منهای `groupBy` روی `from_bucket`، به ازای `lot_id` یا `account_id`.

---

## HW-2.4 — snapshot و ثبت طلب میزبان در پرداخت

`recordReserveCredit(reserve, payment, walletParts, tx)` داخل تراکنش `onPaid` (RS-3.2) صدا زده می‌شود:

1. **snapshot:**
   - `guest_paid` برابر قیمت کامل رزرو، `paid_by_gateway` برابر `payment.pay_by_gateway` و `paid_by_wallet` برابر جمع `walletParts`
   - `fee_percent` از `RESERVE_COMMISSION_PERCENT`، و `host_amount` و `fee_amount` با فرمول README بستهٔ پشتیبانی
   - `canceling_type` و `cancel_tiers` (کپی پله‌های فعلی، HW-01)
   - `check_in_at` و `check_out_at` با `check_in_hour` و `check_out_hour` آگهی (پیش‌فرض ۱۴:۰۰ و ۱۲:۰۰) به وقت تهران. `check_in_at` همان «لحظهٔ تحویل اقامتگاه» است.
   - `release_at`، `complaint_window_ends_at` و `stages` از جدول مرحله‌های HW-2.5
2. حساب `HOST_RECEIVABLE` میزبان. **برای هر مرحله یک lot** با `source = HOST_SHARE`، `reserve_id`، `stage_seq` و `release_at` همان مرحله، و `move(null → PENDING)` با کلید `reserve:{id}:credit:{seq}`. اقامت عادی یک مرحله دارد.
3. لاگ ممیزی `CREDIT_RECORDED`.

**سهم میزبان به منشأ پول مهمان بستگی ندارد.** چه مهمان با درگاه، چه با کیف پول شخصی، کارت هدیه یا اعتبار سازمانی پرداخت کند، میزبان ۸۰٪ قیمت را طلب می‌گیرد. تفکیک «پول واقعی» از «پاداش» در lotهای مهمان و گزارش HW-7.2 است.

**طلب ساخته نمی‌شود وقتی:** پرداخت ناموفق است، تاریخ‌ها تعارض دارند (۱۳۰)، پرداخت جایگزین شده، یا مسیر اشتراک و تماس مستقیم است (۱۰۰).

---

## HW-2.5 — قاعدهٔ آزادسازی، توقف و رفع توقف طلب میزبان

**تصمیم کارفرما:** سهم ۸۰٪ میزبان **۲۴ ساعت بعد از تحویل موفق اقامتگاه به مهمان** قابل تسویه می‌شود. نه ابتدای ورود، نه وسط اقامت و نه الزاماً بعد از پایان اقامت. شرط آن این است که در این ۲۴ ساعت شکایت مستند و بازی دربارهٔ تحویل ثبت نشده باشد (HW-09). تأیید تحویل توسط مهمان اختیاری است و آزادسازی را جلو یا عقب نمی‌اندازد.

**جدول مرحله‌ها** (تابع خالص `buildReleaseSchedule(snapshot, settings)` در `Back/src/wallet/common/release-schedule.ts` با تست کامل). `H = check_in_at` (لحظهٔ تحویل) و `n` تعداد شب‌هاست:

| اقامت | مرحله‌ها | `release_at` هر مرحله | پایان مهلت گزارش مشکل در اپ |
| --- | --- | --- | --- |
| یک‌شبه (`n = 1`) | ۱ | `check_out_at`، چون مهمان کمتر از ۲۴ ساعت در اقامتگاه است (تصمیم کارفرما) | `check_out_at` |
| ۲ تا ۶ شب | ۱ | `H + 24h` | `H + 24h` |
| `n ≥ WALLET_STAGED_MIN_NIGHTS` (پیش‌فرض ۷) | `ceil(n / WALLET_STAGE_NIGHTS)` | مرحلهٔ `k` (از صفر): `H + 24h + k × WALLET_STAGE_NIGHTS روز` | `H + 24h` |

- **مبلغ هر مرحله:** `round(host_amount × شب‌های مرحله / n)`. مرحلهٔ آخر باقی‌مانده را می‌گیرد تا جمع دقیق بماند.
- **مثال:** اقامت ۲۰ شبه با سهم ۱۶ میلیون، در سه مرحلهٔ ۷، ۷ و ۶ شب: ۵٫۶، ۵٫۶ و ۴٫۸ میلیون. مرحلهٔ اول ۲۴ ساعت بعد از تحویل، مرحلهٔ دوم ۷ روز بعد از آن و مرحلهٔ سوم ۱۴ روز بعد از آن آزاد می‌شود. به این ترتیب در اقامت طولانی کل پول از روز اول آزاد نمی‌شود و اگر مشکلی وسط اقامت پیش بیاید، بخشی از طلب هنوز آزاد نشده است.

**آزادسازی:** `@Cron(CronExpression.EVERY_HOUR)` در `Back/src/tasks/tasks.service.ts`، lotهای `HOST_SHARE` با `release_at <= now` و موجودی `PENDING` را آزاد می‌کند (`PENDING → AVAILABLE`، کلید `reserve:{id}:release:{seq}`)، به شرط‌های زیر:
- رزرو در وضعیت ۹۰ باشد (رزرو لغوشده آزاد نمی‌شود)
- هیچ شکایت تحویل `OPEN` یا `AWAITING_FINANCE` برای این رزرو نباشد (HW-09)

اجرا در دسته‌های ۲۰۰تایی روی ایندکس `release_at` است. **قفل حساب** تضمین می‌کند که شکایتی که در آخرین لحظهٔ مهلت ثبت می‌شود و آزادسازی هم‌زمان پشت سر هم اجرا شوند، نه با هم.

**نمایش به میزبان:** میزبان سه وضعیت می‌بیند: «در انتظار تسویه»، «قابل تسویه» و «تسویه‌شده» (HW-04).

**توقف و رفع توقف:**
- **`hold(reserveId, reason)`:** موجودی `PENDING` و `AVAILABLE` همهٔ مرحله‌های این رزرو به `ON_HOLD` منتقل می‌شود، با کلید `reserve:{id}:hold:{seq}:{n}`. دو منبع دارد: ثبت شکایت تحویل (HW-09، خودکار) و پنل مالی (HW-5.6، با دلیل اجباری).
- **`unhold`:** هر مرحله به `AVAILABLE` برمی‌گردد اگر `release_at` آن گذشته است، وگرنه به `PENDING`. رفع توقفی که منشأش شکایت است، فقط با بستن همان شکایت انجام می‌شود (HW-09). پنل مالی روی آن خطای 409 می‌گیرد.
- `PROCESSING` قابل توقف نیست. حوالهٔ در جریان باید تأیید یا رد شود.

## HW-2.6 — انقضای lotها

`expireDueLots` در همان cron ساعتی، lotهایی را که `expires_at <= now` و موجودی `AVAILABLE` دارند پیدا و مانده را با کلید `lot:{id}:expire` به `EXPIRED` منتقل می‌کند.
- موجودی `HELD` منقضی نمی‌شود تا پرداخت در جریان تمام شود. بعد از `releaseHold`، اجرای بعدی cron آن را منقضی می‌کند.
- انقضا قابل برگشت نیست (تصمیم کارفرما برای کارت هدیه و اعتبار سازمانی).

---

## HW-2.7 — رمزنگاری و ماسک

- `Back/src/common/helpers/secret-box.helper.ts` با `crypto` خود Node: `seal(plain)` ← `v1:{iv}:{tag}:{cipher}` با AES-256-GCM و IV تصادفی ۱۲ بایتی، و `open(sealed)`. کلید از `BANK_DATA_KEY` (۳۲ بایت base64، اختیاری در validation) خوانده می‌شود. اگر کلید خالی باشد، endpointهای شبا خطای 503 می‌دهند.
- `maskIban` ← `IR05 **** **** **** **** 9012`.
- تست: رفت و برگشت، دستکاری ciphertext و کلید اشتباه.

## HW-2.8 — لاگ ممیزی مالی

`FinanceAuditService.log({ actorType, actorId, action, entity, entityId, permission, data, ip })`. `data` قبل از ذخیره از `maskSensitive` عبور می‌کند که `iban`، `iban_enc`، `account_number`، `account_no_enc`، `gift_code` و `code` را ماسک می‌کند.

---

## معیار پذیرش فاز

- [ ] پرداخت sandbox → یک snapshot، یک lot `HOST_SHARE` و یک ردیف `PENDING` با ۸۰٪ قیمت. با پرداخت ترکیبی (OW-02)، `paid_by_wallet + paid_by_gateway = guest_paid`.
- [ ] پرداخت ناموفق، ۱۳۰ و ۱۰۰ هیچ ردیفی نمی‌سازند. صدا زدن دوبارهٔ `recordReserveCredit` ردیف دوم نمی‌سازد.
- [ ] تست‌های `buildReleaseSchedule`: یک‌شبه در `check_out_at`، سه‌شبه در `H + 24h`، و ۲۰ شبه در سه مرحله با جمع دقیق.
- [ ] cron مرحله‌ها را سر وقت آزاد می‌کند. رزرو با شکایت باز یا لغوشده آزاد نمی‌شود. lotهای منقضی `EXPIRED` می‌شوند، بدون اینکه به `HELD` دست زده شود.
- [ ] `hold` و `unhold` جمع کل را ثابت نگه می‌دارند. مانده‌ها با جمع دستی ردیف‌ها برابرند.
- [ ] هیچ update یا delete برای `walletLedgerEntry` و `walletLot` در کد نیست.
- [ ] تست‌های secret-box، `maskSensitive` و قفل دو حساب پاس می‌شوند. Back: lint، test و tsc. سپس `/security-review`.
