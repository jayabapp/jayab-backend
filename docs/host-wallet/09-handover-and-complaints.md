# ۰۹ — تحویل اقامتگاه و گزارش مشکل تحویل (Back + Front + Panel)

**وابستگی:** HW-02 (قاعدهٔ آزادسازی و `hold`)، HW-06 (محاسبهٔ بازگشت وجه و HW-6.6)، و RS-05 (میز کار پشتیبان). **پیش‌نیاز اولین تسویهٔ واقعی:** بله. بدون این فاز، آزادسازی خودکار ۲۴ ساعت بعد از تحویل هیچ راهی برای توقف در صورت مشکل ندارد.
**خروجی:**
- تأیید اختیاری تحویل توسط مهمان
- گزارش مستند مشکل تحویل در مهلت ۲۴ ساعت
- توقف خودکار تسویه
- رسیدگی پشتیبان
- بازگشت وجه جزئی با تأیید مالی
- اطلاع‌رسانی به میزبان و مهمان

**تصمیم کارفرما:**
1. سهم میزبان ۲۴ ساعت بعد از تحویل موفق اقامتگاه قابل تسویه می‌شود (HW-2.5). در اقامت یک‌شبه، بعد از خروج مهمان.
2. اگر مهمان در ۲۴ ساعت اول مشکل مستندی دربارهٔ تحویل گزارش کند، تسویه تا تعیین تکلیف متوقف می‌شود.
3. **تأیید مهمان اختیاری است:**
   - تأیید، تحویل را ثبت می‌کند ولی به‌تنهایی باعث تسویهٔ فوری نمی‌شود.
   - عدم تأیید، مانع تسویهٔ خودکار بعد از مهلت نیست.
   - شکایت ثبت‌شده، تسویه را تا بررسی پشتیبان متوقف می‌کند.
4. برای اقامت‌های طولانی، تسویهٔ مرحله‌ای (HW-2.5).
5. این زمان باید در قوانین رزرو و قرارداد میزبان صریحاً ثبت شود (HW-0.1).

**هدف این مدل:** تعادل بین اعتماد میزبان، امنیت پول مهمان و جلوگیری از افزایش پرونده‌های پشتیبانی.

---

## HW-9.1 — مدل

```prisma
model PropertyReserve {
  // ...existing (reserve-support)
  guest_checked_in_at DateTime?            // optional "I received the stay" from the guest; evidence only
}

model HandoverComplaint {
  id                      Int       @id @default(autoincrement())
  reserve_id              Int
  opened_by               String    @db.VarChar(8)    // GUEST | ADMIN
  opened_by_admin_id      Int?
  category                String    @db.VarChar(24)   // NOT_HANDED_OVER | NOT_AS_LISTED | CLEANLINESS | MISSING_AMENITIES | SAFETY | OTHER
  description             String
  attachment_ids          Int[]                       // at least one photo or video (documented)
  status                  Int       @db.SmallInt      // 10 OPEN, 20 AWAITING_FINANCE, 30 RESOLVED_NO_IMPACT, 40 REJECTED, 50 RESOLVED_REFUND, 60 RESOLVED_CANCELED
  support_admin_id        Int?
  decision_note           String?
  proposed_refund_percent Int?      @db.SmallInt      // of guest_paid, proposed by support
  approved_by             Int?                        // finance (guest-refunds:u), must differ from support_admin_id
  refund_amount           Int?
  refund_to_wallet        Int?
  refund_to_bank          Int?
  host_amount_after       Int?
  opened_at               DateTime  @default(now())
  decided_at              DateTime?
  closed_at               DateTime?
  @@index([reserve_id])
  @@index([status, opened_at])
  @@map("handover_complaints")
}
```

- هر رزرو در هر لحظه حداکثر **یک** شکایت باز دارد (`OPEN` یا `AWAITING_FINANCE`). این با یک ایندکس یکتای شرطی با SQL خام در migration HW-2.1 تضمین می‌شود:
  ```sql
  CREATE UNIQUE INDEX handover_complaints_open_key ON handover_complaints (reserve_id) WHERE status IN (10, 20);
  ```
- **«مستند» یعنی:** دسته‌بندی، توضیح دست‌کم ۳۰ حرف، و دست‌کم یک عکس یا ویدیو. بدون مدرک، دکمهٔ ثبت فعال نمی‌شود و Back هم رد می‌کند.

---

## HW-9.2 — APIهای مهمان (Back)

در `Back/src/property-reserve/roles/user/user.controller.ts`، با مالکیت چک‌شده با `findById`:

| متد | مسیر | کار |
| --- | --- | --- |
| POST | `/api/v1/reserves/:id/checked-in` | تأیید اختیاری تحویل. مجاز از ۲ ساعت قبل از `check_in_at` تا `check_out_at`، فقط برای وضعیت ۹۰. `guest_checked_in_at` را پر می‌کند و لاگ `GUEST_CHECKED_IN` ثبت می‌شود. **هیچ اثری روی `release_at` ندارد.** تکرار بی‌اثر است. |
| POST | `/api/v1/reserves/:id/handover-complaint` | بدنه `{ category, description, attachment_ids }`. مجاز از `check_in_at` تا `complaint_window_ends_at` (snapshot)، فقط برای وضعیت ۹۰ و اگر شکایت باز دیگری نیست. |
| GET | `/api/v1/reserves/:id/handover-complaint` | وضعیت شکایت برای کارت مهمان (بدون یادداشت داخلی پشتیبان) |

**منطق ثبت شکایت** در یک تراکنش با قفل حساب `HOST_RECEIVABLE` میزبان:
1. ساخت `HandoverComplaint` با `status = OPEN`.
2. `WalletService.hold(reserveId, 'HANDOVER_COMPLAINT')` (HW-2.5). مرحله‌هایی که `PROCESSING` یا `SETTLED` هستند دست نمی‌خورند.
3. لاگ `HANDOVER_COMPLAINT_OPENED`.

**بعد از commit:**
- اعلان پنل `RESERVE_HANDOVER_COMPLAINT` (نوع جدید در `Back/src/firebase/constants/notif-types.ts` و `NotificationPermissionList`)
- پیامک `HANDOVER_COMPLAINT_HOST` به میزبان: «مهمان رزرو #CODE# گزارشی دربارهٔ تحویل اقامتگاه ثبت کرده است. پشتیبانی جایاب با شما تماس می‌گیرد. تسویهٔ این رزرو تا بررسی متوقف است.»
- تأییدیه به مهمان

**مدارک:** آپلود با endpoint موجود کاربر (`POST attachments`، `Back/src/attachment/attachment.controller.ts:82`). حداکثر ۶ فایل تصویری یا ویدیویی، و فقط پیوست‌هایی که همین کاربر آپلود کرده پذیرفته می‌شوند. اگر پیوست‌ها عمومی‌اند، همان بررسی HW-0.6 برای خصوصی بودن لازم است، چون عکس‌های داخل اقامتگاه داده‌های خصوصی‌اند.

**بعد از مهلت:** endpoint خطای 422 با `HANDOVER_WINDOW_CLOSED` می‌دهد. مهمان می‌تواند با پشتیبانی تماس بگیرد و پشتیبان شکایت را ثبت می‌کند (HW-9.3)، ولی فقط مرحله‌هایی متوقف می‌شوند که هنوز آزاد یا حواله نشده‌اند.

---

## HW-9.3 — رسیدگی پشتیبان (Back + Panel)

**Back:** به کنترلر پشتیبان (`Back/src/property-reserve/roles/support/support.controller.ts`، RS-5.1) اضافه می‌شود:

| متد | مسیر | کار |
| --- | --- | --- |
| GET | `/admin/reserve-support?tab=complaints` | برگهٔ جدید صف (RS-5.2): شکایت‌های `OPEN` و `AWAITING_FINANCE`، قدیمی‌ترین اول، با زمان سپری‌شده |
| POST | `/admin/reserve-support/:id/handover-complaint` | ثبت شکایت از طرف مهمان با تماس تلفنی (`opened_by = ADMIN`). همان مدارک لازم است، یا یادداشت «مدرک تلفنی» با دلیل. تا `check_out_at` مجاز است. |
| POST | `/admin/reserve-support/:id/handover-complaint/decide` | بدنه `{ decision, note, refund_percent? }`. جزئیات در جدول پایین. |

| `decision` | نتیجه |
| --- | --- |
| `NO_IMPACT` | مشکل رفع شد و اثر مالی ندارد. `RESOLVED_NO_IMPACT` و `unhold`: مرحله‌هایی که `release_at` گذشته فوراً قابل تسویه می‌شوند. |
| `REJECT` | شکایت وارد نیست. `REJECTED` و `unhold`. |
| `PROPOSE_REFUND` | با `refund_percent` (۱ تا ۱۰۰، از `guest_paid`): `AWAITING_FINANCE`. توقف ادامه دارد و صف مالی خبر می‌شود. |
| `CANCEL_STAY` | تحویل انجام نشد و کل اقامت لغو می‌شود. همان `cancelPaidReserve(..., 'HOST')` (HW-6.3) با بازگشت صددرصدی، اما حتی بعد از ساعت ورود مجاز است. شکایت `RESOLVED_CANCELED` می‌شود. |

- **مرز اختیار:** پشتیبان درصد پیشنهادی را ثبت می‌کند، ولی مبلغی را تغییر نمی‌دهد (HW README، تصمیم ۷). بازگشت جزئی با تأیید مالی انجام می‌شود (HW-9.4). لغو کامل قاعده‌مند است (۱۰۰٪) و مثل HW-6.3 با پشتیبان انجام می‌شود.
- **Panel:**
  - برگهٔ «گزارش‌های تحویل» در صف پشتیبانی (`Panel/app/reserve-support/page.tsx`).
  - کارت «گزارش مهمان دربارهٔ تحویل» در میز کار (`Panel/app/reserve-support/show/[id]/`) شامل:
    - دسته، توضیح و گالری مدارک (لینک موقت امضاشده)
    - زمان تحویل رسمی، `guest_checked_in_at`، و شماره‌های مهمان و میزبان
    - مرحله‌های تسویه و وضعیتشان (از HW-7.1)
    - چهار دکمهٔ تصمیم با `ConfirmModal`. پیشنهاد بازگشت فیلد درصد دارد، با پیش‌نمایش «بازگشت به مهمان: X تومان؛ سهم میزبان: Y تومان».
- **SLA:** شکایت باز بیشتر از ۲۴ ساعت در صف برچسب قرمز می‌گیرد و در گزارش HW-7.2 شمرده می‌شود. هدف این است که پول میزبان بی‌دلیل معطل نشود.

## HW-9.4 — تأیید مالی بازگشت جزئی

- **Back:** `admin/guest-refunds/complaints` (ماژول `guest-refunds`):
  - `GET` صف `AWAITING_FINANCE`
  - `PATCH :complaintId/approve` و `PATCH :complaintId/reject { reason }`. رد، شکایت را با یادداشت به پشتیبان برمی‌گرداند (`OPEN`).
  - تأییدکننده نمی‌تواند همان `support_admin_id` باشد (کنترل دو نفره، D2).
- **`approve` در یک تراکنش:**
  1. `refund = round(guest_paid × p / 100)`. `retained = guest_paid - refund`. `host_amount_after` و سهم جایاب با قاعدهٔ D5 (۸۰/۲۰ از مبلغ نگه‌داشته‌شده). همان تابع `computeCancellation` با پلهٔ ثابت `p` استفاده شود، نه کد جدید.
  2. **کم شدن طلب میزبان:** `snapshot.host_amount - host_amount_after` از مرحله‌های `ON_HOLD` به `VOID` (کلید `reserve:{id}:complaint:{cid}:{seq}`)، از آخرین مرحله به اول. اگر مرحله‌های آزادنشده کافی نباشند، چون بخشی قبلاً تسویه شده، خطای 409 با `COMPLAINT_EXCEEDS_UNSETTLED` برمی‌گردد و موضوع به رسیدگی دستی مالی می‌رود (خارج از این نسخه).
  3. **تقسیم بازگشت** بین کیف پول و درگاه، دقیقاً مثل HW-6.6 (lot `REFUND` در همان حساب‌ها، و `GuestRefund` با `source = COMPLAINT` فقط برای سهم درگاه).
  4. شکایت `RESOLVED_REFUND` با مبلغ‌ها. وضعیت رزرو ۹۰ می‌ماند، چون اقامت انجام شده است.
  5. `unhold` مرحله‌های باقی‌مانده.
- **بعد از commit:** پیامک به مهمان («{مبلغ} تومان بابت گزارش شما برمی‌گردد») و به میزبان («سهم شما از رزرو #CODE# بعد از بررسی گزارش مهمان {مبلغ} تومان شد»).
- **تکمیل `GuestRefund.source`** (HW-2.1): مقدار `COMPLAINT` اضافه می‌شود.

---

## HW-9.5 — Front

**کارت رزرو مهمان (RS-4.4، وضعیت ۹۰):**
- **از ۲ ساعت قبل از ورود تا خروج:** دکمهٔ ثانویهٔ «اقامتگاه را تحویل گرفتم» (اختیاری، با متن «ثبت تحویل به ما کمک می‌کند؛ لازم نیست»). بعد از ثبت: «تحویل ثبت شد · {زمان}».
- **از لحظهٔ ورود تا `complaint_window_ends_at`:** دکمهٔ «گزارش مشکل در تحویل اقامتگاه» با شمارندهٔ «تا {زمان} فرصت دارید».
  - **sheet گزارش:** انتخاب دسته (شش گزینهٔ ترجمه‌شده)، توضیح با شمارندهٔ حداقل ۳۰ حرف، آپلود عکس یا ویدیو (حداقل یک و حداکثر شش، با کامپوننت آپلود موجود Front در `Front/features/upload/`)، متن «تسویهٔ سهم میزبان تا بررسی گزارش شما متوقف می‌شود و پشتیبانی جایاب با شما تماس می‌گیرد»، و دکمهٔ «ثبت گزارش».
  - بعد از ثبت، chip وضعیت: «در حال بررسی»، «رسیدگی شد»، «بازگشت {مبلغ} تومان» یا «رزرو لغو شد».
- **بعد از مهلت:** «برای گزارش مشکل با پشتیبانی جایاب تماس بگیرید» با شمارهٔ پشتیبانی.

**کارت رزرو میزبان (RS-4.2):** بنر «مهمان گزارشی دربارهٔ تحویل ثبت کرده است. تسویهٔ این رزرو تا بررسی متوقف است.» مدارک و توضیح مهمان به میزبان نمایش داده نمی‌شود و پشتیبان با او تماس می‌گیرد.

**متن‌ها:** namespace `reserve` در سه زبان و دو تم (XC-4). کدهای خطا در `apiErrors`: `HANDOVER_WINDOW_CLOSED`، `HANDOVER_COMPLAINT_EXISTS`، `HANDOVER_EVIDENCE_REQUIRED` و `HANDOVER_DESCRIPTION_TOO_SHORT`.

---

## حالت‌های مرزی

| حالت | رفتار |
| --- | --- |
| مهمان هیچ‌وقت «تحویل گرفتم» را نمی‌زند | آزادسازی سر وقت انجام می‌شود (تصمیم کارفرما) |
| مهمان «تحویل گرفتم» را زود می‌زند | فقط ثبت می‌شود و `release_at` تغییر نمی‌کند |
| شکایت در دقیقهٔ آخر مهلت و آزادسازی هم‌زمان | قفل حساب ترتیب را مشخص می‌کند. اگر شکایت اول ثبت شد، آزادسازی رد می‌شود. اگر آزادسازی اول بود، `hold` مبلغ `AVAILABLE` را هم متوقف می‌کند، چون هنوز حواله نشده است. |
| اقامت ۲۰ شبه، مشکل در روز دهم | مهمان از پشتیبانی کمک می‌گیرد و پشتیبان شکایت را ثبت می‌کند. مرحلهٔ اول احتمالاً تسویه شده و مرحله‌های دوم و سوم متوقف می‌شوند. بازگشت فقط تا سقف مرحله‌های تسویه‌نشده ممکن است. |
| لغو قبل از ورود | HW-06. هنوز هیچ مرحله‌ای آزاد نشده است. |
| رزرو با کیف پول پرداخت شده | بازگشت جزئی مثل HW-6.6 به همان کیف پول برمی‌گردد |

## معیار پذیرش فاز

- [ ] رزرو سه‌شبه بدون «تحویل گرفتم»: ۲۴ ساعت بعد از ساعت ورود قابل تسویه می‌شود. با «تحویل گرفتم»: همان زمان، نه زودتر.
- [ ] شکایت با عکس در ساعت پنجم: تسویه متوقف و پیامک به میزبان. شکایت بدون مدرک یا بعد از ۲۴ ساعت رد می‌شود.
- [ ] تصمیم «بدون اثر» یا «رد»: آزادسازی فوری اگر زمانش گذشته باشد.
- [ ] پیشنهاد ۳۰٪: تأیید مالی توسط نفر دیگر، بازگشت ۳ میلیون از ۱۰ میلیون، سهم میزبان ۵٫۶ میلیون (۸۰٪ از ۷ میلیون)، و ردیف‌های `VOID` و `REFUND` درست.
- [ ] اقامت یک‌شبه: مهلت گزارش و آزادسازی هر دو در ساعت خروج.
- [ ] سه زبان و دو تم (XC-7). Back، Front و Panel: lint، build و test. سپس `/security-review` (مدارک خصوصی و مالکیت).
