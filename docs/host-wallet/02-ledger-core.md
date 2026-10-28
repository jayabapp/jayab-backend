# ۰۲ — هستهٔ دفترکل (Back)

**وابستگی:** HW-01 (در همین release). **باید همزمان با RS-03 بستهٔ پشتیبانی merge شود**، چون `ReservePaymentService.onPaid` (RS-3.2) متد `recordReserveCredit` همین فاز را صدا می‌زند.
**خروجی:** migration کامل کیف پول، ماژول `wallet`، snapshot مالی، ثبت طلب، محاسبهٔ مانده از دفترکل، آزادسازی، توقف و رفع توقف، رمزنگاری شبا و لاگ ممیزی مالی.

---

## HW-2.1 — migration کیف پول

فایل: `Back/prisma/migrations/20261028130000_add_host_wallet/migration.sql`. ردیف ۱۶ در `Back/docs/NEW-APP-DEPLOYMENT.md`، بعد از `add_reserve_support`: «افزایشی؛ ۹ جدول جدید؛ دو تنظیم و چهار ماژول دسترسی درج می‌شود».

```prisma
// CancellationPolicyTier — see HW-1.1

model HostBankAccount {
  id             Int       @id @default(autoincrement())
  owner_id       Int       @unique                  // one active destination per host
  user_id        Int                                // owner's user, for joins with the ledger
  holder_name    String                             // from verified identity, not typed by the host
  iban_enc       String                             // secret-box ciphertext (HW-2.6)
  iban_last4     String    @db.VarChar(4)
  bank_code      String    @db.VarChar(3)
  account_no_enc String?
  status         Int       @db.SmallInt             // 10 PENDING_REVIEW, 20 VERIFIED, 30 NEEDS_FIX
  review_note    String?
  verified_by    Int?
  verified_at    DateTime?
  created_at     DateTime  @default(now())
  updated_at     DateTime  @updatedAt
  @@map("host_bank_accounts")
}

model ReserveFinancialSnapshot {                   // written once, inside the payment callback
  id             Int      @id @default(autoincrement())
  reserve_id     Int      @unique
  payment_id     Int      @unique
  host_user_id   Int
  guest_user_id  Int
  guest_paid     Int
  fee_percent    Int      @db.SmallInt            // 20 at the time of payment
  fee_amount     Int
  host_amount    Int
  canceling_type String   @db.VarChar(8)
  cancel_tiers   Json                              // copy of CancellationPolicyTier rows at payment time (D7)
  check_in_at    DateTime                          // date + listing check_in_hour, Tehran
  check_out_at   DateTime
  release_at     DateTime                          // check_out_at + WALLET_RELEASE_HOURS_AFTER_CHECKOUT (D1)
  created_at     DateTime @default(now())
  @@index([host_user_id])
  @@index([release_at])
  @@map("reserve_financial_snapshots")
}

model WalletLedgerEntry {                          // insert-only
  id            Int      @id @default(autoincrement())
  event_key     String   @unique @db.VarChar(64)
  host_user_id  Int
  reserve_id    Int
  settlement_id Int?
  from_bucket   String?  @db.VarChar(12)          // null = new credit
  to_bucket     String   @db.VarChar(12)          // PENDING AVAILABLE ON_HOLD PROCESSING SETTLED VOID
  amount        Int                               // > 0
  reason        String?
  admin_id      Int?
  created_at    DateTime @default(now())
  @@index([host_user_id, reserve_id])
  @@index([settlement_id])
  @@map("wallet_ledger_entries")
}

model Settlement {
  id               Int       @id @default(autoincrement())
  host_user_id     Int
  bank_account_id  Int
  iban_enc         String                          // destination snapshot at creation
  iban_last4       String    @db.VarChar(4)
  amount           Int
  source_account   String    @db.VarChar(64)       // from WALLET_SOURCE_ACCOUNTS
  paid_on          DateTime  @db.Date
  tracking_code    String    @db.VarChar(64)
  receipt_id       Int?                            // private attachment
  note             String?
  status           Int       @db.SmallInt          // 10 PROCESSING, 20 SETTLED, 30 FAILED
  needs_recheck    Boolean   @default(false)       // host changed IBAN after this was created (HW-3.1, HW-5.4)
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

model ReserveCancellation {                       // the financial correction record (HW-06)
  id             Int      @id @default(autoincrement())
  reserve_id     Int      @unique
  canceled_by    String   @db.VarChar(8)          // GUEST | HOST
  admin_id       Int?                             // when support recorded it
  hours_before   Int
  refund_percent Int      @db.SmallInt
  refund_amount  Int
  host_amount    Int                              // host's share after cancellation
  fee_amount     Int
  created_at     DateTime @default(now())
  @@map("reserve_cancellations")
}

model GuestRefund {                               // HW-06
  id            Int       @id @default(autoincrement())
  reserve_id    Int?
  payment_id    Int       @unique
  guest_user_id Int
  source        String    @db.VarChar(16)         // CANCEL | HOST_CANCEL | CONFLICT | ORPHAN_PAYMENT
  amount        Int
  holder_name   String?
  iban_enc      String?
  iban_last4    String?   @db.VarChar(4)
  status        Int       @db.SmallInt            // 10 AWAITING_INFO, 20 READY, 30 PROCESSING, 40 REFUNDED, 50 FAILED
  source_account String?  @db.VarChar(64)
  paid_on       DateTime? @db.Date
  tracking_code String?   @db.VarChar(64)
  receipt_id    Int?
  failure_reason String?
  created_by    Int?
  confirmed_by  Int?
  confirmed_at  DateTime?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  @@index([status])
  @@map("guest_refunds")
}

model FinanceAuditLog {
  id          Int      @id @default(autoincrement())
  actor_type  String   @db.VarChar(8)             // ADMIN | USER | SYSTEM
  actor_id    Int?
  action      String   @db.VarChar(48)
  entity      String   @db.VarChar(32)
  entity_id   Int
  permission  String?  @db.VarChar(48)            // RBAC module + verb used
  data        Json?                               // before/after, IBANs masked
  ip          String?  @db.VarChar(45)
  created_at  DateTime @default(now())
  @@index([entity, entity_id])
  @@map("finance_audit_logs")
}
```

داده‌های همین migration:

```sql
INSERT INTO "settings" ("title","key","value","min","max","data_type","sort_order","updated_at") VALUES
 ('آزادسازی طلب میزبان بعد از خروج مهمان (ساعت)', 'WALLET_RELEASE_HOURS_AFTER_CHECKOUT', '24', 0, 720, 'NUMBER', 120, NOW()),
 ('حساب‌های مبدأ تسویه (JSON: [{"key":"mellat-4421","title":"ملت · جاری ۴۴۲۱"}])', 'WALLET_SOURCE_ACCOUNTS', '[]', NULL, NULL, 'TEXT_AREA', 121, NOW())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "access_control_modules" ("key","name","updated_at") VALUES
 ('host-bank-accounts','حساب‌های بانکی میزبان', NOW()),
 ('settlements','تسویهٔ میزبان', NOW()),
 ('guest-refunds','بازگشت وجه مهمان', NOW()),
 ('cancellation-policies','قوانین کنسلی', NOW())
ON CONFLICT ("key") DO NOTHING;
```

همین ردیف‌ها در `setting.seeder.ts` و `module.seeder.ts` هم اضافه شوند. migration روی هیچ سروری اجرا نمی‌شود.

**چرا ستون موجودی وجود ندارد:** مانده همیشه از جمع ردیف‌های `WalletLedgerEntry` محاسبه می‌شود (سند، بند ۱۴: «ویرایش دستی عدد موجودی ممنوع»). هیچ endpointی ردیف دفترکل را ویرایش یا حذف نمی‌کند و هیچ متد `update` یا `delete` برای این مدل در کد نوشته نمی‌شود.

---

## HW-2.2 — ماژول و سرویس دفترکل

- **پوشه:** `Back/src/wallet/` با `wallet.module.ts`، `common/` (ثابت‌ها، typeها، helperها) و `services/wallet.service.ts`. نقش‌ها در فازهای بعد اضافه می‌شوند.
- `WalletModule` در `app.module.ts` ثبت می‌شود و `WalletService` را export می‌کند.

```ts
recordReserveCredit(reserve, payment, tx): Promise<void>          // HW-2.3
release(reserveId, tx?): Promise<boolean>                          // HW-2.5
hold(reserveId, reason, adminId): Promise<void>                    // HW-2.4
unhold(reserveId, reason, adminId): Promise<void>
voidForCancellation(reserveId, amount, tx): Promise<void>          // HW-06
reserveBalances(reserveId): Promise<Record<Bucket, number>>
hostBalances(hostUserId): Promise<Record<Bucket, number>>
move(tx, { key, hostUserId, reserveId, from, to, amount, reason, adminId?, settlementId? }): Promise<boolean>
```

- **`move`** تنها متد نوشتن است:
  - قبل از نوشتن `SELECT pg_advisory_xact_lock(host_user_id)` اجرا می‌کند.
  - اگر `from` پر است، موجودی همان bucket برای همان رزرو را با جمع ردیف‌ها چک می‌کند و اگر کافی نبود خطا می‌دهد.
  - اگر `event_key` تکراری بود (P2002)، `false` برمی‌گرداند و خطا نمی‌دهد. این همان «پاسخ تکراری درگاه بدون دوباره‌شماری» است.
- **محاسبهٔ مانده:** یک `groupBy` روی `to_bucket` منهای یک `groupBy` روی `from_bucket`، برای `host_user_id` یا `reserve_id`.

---

## HW-2.3 — snapshot و ثبت طلب در پرداخت

`recordReserveCredit(reserve, payment, tx)` داخل تراکنش `onPaid` (RS-3.2) صدا زده می‌شود:

1. **snapshot:**
   - `guest_paid = payment.amount`
   - `fee_percent` از تنظیم `RESERVE_COMMISSION_PERCENT`
   - `host_amount` و `fee_amount` با فرمول README بستهٔ پشتیبانی
   - `canceling_type` آگهی و `cancel_tiers` (کپی پله‌های فعلی همان قانون از HW-01)
   - `check_in_at` و `check_out_at` با `check_in_hour` و `check_out_hour` آگهی (پیش‌فرض ۱۴:۰۰ و ۱۲:۰۰) به وقت تهران
   - `release_at`
2. `move({ key: 'reserve:{id}:credit', from: null, to: 'PENDING', amount: host_amount, reason: 'ثبت طلب بعد از تأیید درگاه' })`.
3. لاگ ممیزی `CREDIT_RECORDED`.

**طلب ساخته نمی‌شود وقتی:** پرداخت ناموفق است، تاریخ‌ها تعارض دارند (۱۳۰)، پرداخت جایگزین شده (`ORPHAN_PAYMENT`)، یا مسیر اشتراک و تماس مستقیم است (۱۰۰). همهٔ این‌ها در RS-3.2 و RS-7.2 قبل از رسیدن به این متد جدا شده‌اند.

---

## HW-2.4 — توقف و رفع توقف

- **`hold`:** کل موجودی `PENDING` یا `AVAILABLE` همان رزرو به `ON_HOLD` منتقل می‌شود، با کلید `reserve:{id}:hold:{n}`. `n` شمارندهٔ توقف‌های همان رزرو است.
- **`unhold`:** موجودی به bucket قبلی برمی‌گردد. اگر `release_at` گذشته است `AVAILABLE`، وگرنه `PENDING`.
- هر دو فقط از پنل مالی (HW-5.6) و با دلیل اجباری صدا زده می‌شوند. پشتیبان این دسترسی را ندارد.
- `PROCESSING` قابل توقف نیست. حوالهٔ در جریان باید تأیید یا رد شود.

## HW-2.5 — آزادسازی (D1)

- یک `@Cron(CronExpression.EVERY_HOUR)` در `Back/src/tasks/tasks.service.ts` snapshotهایی را که `release_at <= now` دارند و هنوز موجودی `PENDING` دارند پیدا کند. برای هر کدام `release(reserveId)` اجرا شود که `PENDING → AVAILABLE` با کلید `reserve:{id}:release` است.
- رزروی که `ON_HOLD` است آزاد نمی‌شود، چون موجودی `PENDING` ندارد.
- کلید یکتا اجرای همزمان دو worker را بی‌اثر می‌کند.
- **کارایی:** کوئری روی ایندکس `release_at` است و دسته‌های ۲۰۰تایی را پردازش می‌کند.

---

## HW-2.6 — رمزنگاری و ماسک

- **فایل:** `Back/src/common/helpers/secret-box.helper.ts` با `crypto` خود Node:
  - `seal(plain: string): string` ← `v1:{iv base64}:{tag base64}:{cipher base64}` با AES-256-GCM و IV تصادفی ۱۲ بایتی
  - `open(sealed: string): string`
  - کلید از `BANK_DATA_KEY` (۳۲ بایت base64) خوانده می‌شود. در `configuration-validation.ts` این متغیر `Joi.string().optional()` است. اگر خالی باشد، endpointهای شبا خطای 503 می‌دهند و بقیهٔ برنامه بالا می‌آید.
- **ماسک:** `maskIban('IR050170000000123456789012')` ← `IR05 **** **** **** **** 9012`.
- تست واحد: رفت و برگشت، دستکاری ciphertext (خطای tag) و کلید اشتباه.

## HW-2.7 — لاگ ممیزی مالی

سرویس `FinanceAuditService.log({ actorType, actorId, action, entity, entityId, permission, data, ip })`. `data` قبل از ذخیره از `maskSensitive` عبور می‌کند که کلیدهای `iban`، `iban_enc`، `account_number`، `account_no_enc` و `holder_national_code` را ماسک می‌کند. همهٔ فازهای مالی برای هر تغییر از همین سرویس استفاده می‌کنند.

---

## معیار پذیرش فاز

- [ ] پرداخت sandbox → دقیقاً یک snapshot و یک ردیف `PENDING` با مبلغ ۸۰٪.
- [ ] پرداخت ناموفق، ۱۳۰ و ۱۰۰ هیچ ردیفی نمی‌سازند.
- [ ] صدا زدن دوبارهٔ `recordReserveCredit` برای همان رزرو ردیف دوم نمی‌سازد.
- [ ] با `release_at` در گذشته، cron در کمتر از یک ساعت مبلغ را `AVAILABLE` می‌کند.
- [ ] `hold` و `unhold` جمع کل را ثابت نگه می‌دارند و `hostBalances` با جمع دستی ردیف‌ها برابر است.
- [ ] هیچ متد update یا delete برای `WalletLedgerEntry` در کد نیست (`grep walletLedgerEntry.update` و `.delete` خالی است).
- [ ] تست‌های secret-box و `maskSensitive` پاس می‌شوند. Back: lint، test و tsc. سپس `/security-review`.
