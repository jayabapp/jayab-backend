# ۰۱ — مدل داده، دسته‌بندی آگهی و هستهٔ وضعیت‌ها (Back)

**وابستگی:** ندارد. **پیش‌نیاز انتشار:** ندارد، چون سوئیچ خاموش است و رفتار فعلی تغییر نمی‌کند.
**خروجی:** یک migration، تشخیص دستهٔ آگهی، وضعیت‌ها و علت‌ها، سرویس واحد تغییر وضعیت با لاگ، «اولین پاسخ»، تنظیمات و سوئیچ کلی، فیلد `booking_mode` برای مالک و ماژول دسترسی پشتیبان.

بعد از این فاز، با سوئیچ خاموش هیچ رفتاری تغییر نمی‌کند. با سوئیچ روشن، درخواست‌های دستهٔ ۳ و ۴ با `flow = JAYAB`، سهم میزبان و کمیسیون ذخیره می‌شوند. پیامک و تایمرهای جدید در فاز ۰۲ می‌آیند، پس سوئیچ تا آن موقع روشن نشود.

---

## RS-1.1 — migration واحد

فایل: `Back/prisma/migrations/20261028120000_add_reserve_support/migration.sql`. همهٔ schema این بسته (فازهای ۰۱ تا ۰۷) در همین یک migration است. ردیف ۱۵ با همین نام به جدول `Back/docs/NEW-APP-DEPLOYMENT.md` اضافه شود: «افزایشی؛ همهٔ ستون‌ها nullable یا با default؛ سه تنظیم و یک ماژول دسترسی درج می‌شود». migration کیف پول (`HW-02`) ردیف بعد از آن است.

تغییرات `Back/prisma/schema.prisma`:

```prisma
model Property {
  // ...existing
  booking_mode Int @default(1) @db.SmallInt // 1 = عادی، 2 = فقط رزرو از جایاب (دستهٔ ۴)
}

model PropertyReserve {
  // ...existing fields stay as they are
  flow              Int       @default(1) @db.SmallInt // ReserveFlow — at creation, never changes
  host_share        Int?
  commission        Int?
  reply_token       String?   @unique @db.VarChar(16)
  first_response_at DateTime?                          // stops the guest's 21-minute promise
  escalated_at      DateTime?                          // auto-moved to support (P1)
  host_reply        Int?      @db.SmallInt             // 1 | 2
  host_reply_via    String?   @db.VarChar(8)           // SMS | IVR | LINK | APP | SUPPORT
  host_replied_at   DateTime?
  pay_deadline_at   DateTime?                          // reply + 10m, offer + 10m, subscription + 10m
  payment_id        Int?      @unique
  paid_at           DateTime?
  support_admin_id  Int?
  support_called_at DateTime?
  support_reason    Int?      @db.SmallInt             // ReserveSupportReason
  offer_check_in    DateTime? @db.Date
  offer_check_out   DateTime? @db.Date
  offer_guests      String?
  offer_total       Int?
  offer_note        String?
  offer_sent_at     DateTime?
  guest_called_at   DateTime?
  host_called_at    DateTime?
  canceled_by       String?   @db.VarChar(8)           // GUEST | HOST — for status 140 (HW-06)
  finalized_at      DateTime?
  support_note      String?
  payment           Payment?             @relation(fields: [payment_id], references: [id])
  support_admin     Admin?               @relation(fields: [support_admin_id], references: [id])
  logs              PropertyReserveLog[]

  @@index([flow, status])
  @@index([pay_deadline_at])
}

model PropertyReserveLog {
  id         Int             @id @default(autoincrement())
  reserve_id Int
  admin_id   Int?
  actor      String          @db.VarChar(8)  // SYSTEM | HOST | GUEST | ADMIN
  action     String          @db.VarChar(48)
  data       Json?
  created_at DateTime        @default(now())
  reserve    PropertyReserve @relation(fields: [reserve_id], references: [id], onDelete: Cascade)
  admin      Admin?          @relation(fields: [admin_id], references: [id])

  @@index([reserve_id, created_at])
  @@map("property_reserve_logs")
}

model SmsInbound {
  id          Int      @id @default(autoincrement())
  receive_id  BigInt   @unique                // SMS.ir ReceiveReturnId
  mobile      String   @db.VarChar(15)
  text        String
  line_number String   @db.VarChar(20)
  received_at DateTime
  reserve_id  Int?
  result      String   @db.VarChar(24)        // APPLIED | AMBIGUOUS | UNKNOWN_SENDER | INVALID | LATE | DUPLICATE_ANSWER
  created_at  DateTime @default(now())

  @@index([mobile, created_at])
  @@map("sms_inbounds")
}
```

```prisma
model User {
  // ...existing
  locale String @default("fa") @db.VarChar(2) // fa | ar | en — language of SMS and notifications (XC-1)
}
```

روابط معکوس هم اضافه شوند: `Payment.reserve PropertyReserve?`، `Admin.supported_reserves` و `Admin.reserve_logs`. ستون `User.locale` و middleware و endpoint آن (XC-1 در [`LANGUAGE-AND-THEME.md`](../LANGUAGE-AND-THEME.md)) همراه همین فاز ساخته می‌شوند، چون همهٔ پیامک‌های بسته به آن نیاز دارند. **جدول `turnovers` تغییری نمی‌کند.** سهم میزبان در دفترکل بستهٔ کیف پول ثبت می‌شود.

داده‌ای که در همین migration درج می‌شود (الگوی `20261001120000_add_guest_chat_enabled_setting`):

```sql
INSERT INTO "settings" ("title","key","value","min","max","data_type","sort_order","updated_at") VALUES
 ('رزرو با جایاب برای آگهی‌های احرازشدهٔ بدون اشتراک و کمیسیونی (1 = فعال)', 'RESERVE_JAYAB_FLOW_ENABLED', '0', 0, 1, 'BOOLEAN', 110, NOW()),
 ('درصد کمیسیون رزرو با جایاب', 'RESERVE_COMMISSION_PERCENT', '20', 0, 50, 'NUMBER', 111, NOW()),
 ('ارجاع خودکار درخواست بی‌پاسخ به پشتیبانی بعد از (دقیقه)', 'RESERVE_ESCALATE_AFTER_MINUTES', '15', 1, 21, 'NUMBER', 112, NOW())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "access_control_modules" ("key","name","updated_at")
VALUES ('reserve-support', 'پشتیبانی رزرو', NOW())
ON CONFLICT ("key") DO NOTHING;
```

برای محیط‌های تازه، همین ردیف‌ها در `Back/prisma/seed/setting.seeder.ts` و `Back/prisma/seed/module.seeder.ts` (کنار `{ name: 'رزرو', key: 'property-reserves' }`، خط ۵۳) هم اضافه شوند.

**معیار پذیرش:** `npx prisma validate` و `npx prisma generate` بدون خطا. migration فقط افزایشی است و روی هیچ سروری اجرا نمی‌شود.

---

## RS-1.2 — وضعیت‌ها، علت‌ها و ثابت‌ها

**`Back/src/property-reserve/common/interfaces/property-reserve-status.type.ts`:**

- وضعیت‌های ۴۰ تا ۱۴۰ را با نام‌های جدول README به enum `PropertyReserveStatus` و با عنوان و رنگ به `PropertyReserveStatusList` اضافه کنید. رنگ‌ها از لیست بالای همین فایل باشند: انتظار `#f59e0b`، پشتیبانی `#f97316`، پیشنهاد `#3b82f6`، اشتراک `#9333ea`، قطعی `#10b981`، پایانی منفی `#f43f5e`.
- `PropertyReserveGuestStatusTitle` برای مهمان عنوان ساده می‌گیرد. وضعیت‌های ۵۰، ۶۰ و ۸۰ برای مهمان «در حال بررسی توسط جایاب» هستند.
- این دسته‌ها export شوند:

```ts
export const JAYAB_OPEN_STATUSES = [10, 40, 50, 60, 70, 80];
export const JAYAB_HOLD_STATUSES = [40, 70];                   // dates temporarily locked
export const JAYAB_SUPPORT_QUEUE_STATUSES = [50, 60, 70, 80];
export const TERMINAL_STATUSES = [20, 30, 90, 100, 110, 120, 130, 140];
```

**فایل جدید `Back/src/property-reserve/common/interfaces/reserve-support-reason.type.ts`:**

| id | نام | گروه | نتیجه |
| ---: | --- | --- | --- |
| 1 | `DAYS_FULL` | ۱ | اقدام اصلاحی (فاز ۰۶) |
| 2 | `PRICE_FIX` | ۱ | اقدام اصلاحی |
| 3 | `CONDITIONS_CHANGED` | ۱ | اقدام اصلاحی |
| 4 | `REJECT` | ۱ | وضعیت ۱۲۰ |
| 5 | `THOUGHT_NO_COMMISSION` | ۲ | شاخهٔ کمیسیون (فاز ۰۷) |
| 6 | `NEEDS_REVIEW` | ۲ | فقط سابقه، باز تا پایان روز (P5) |
| 7 | `VAGUE` | ۲ | فقط سابقه، باز تا پایان روز (P5) |
| 8 | `HOST_UNREACHABLE` | ۳ | وضعیت ۱۱۰. این علت در PDF نیست و برای P2 اضافه شده است. |

**`Back/src/property-reserve/common/constants/reserve.constant.ts`:** مقدار `RESERVE_TTL_MINUTES = 15` برای مسیرهای فعلی **بدون تغییر** بماند. این ثابت‌ها اضافه شوند:

```ts
export const JAYAB_RESPONSE_PROMISE_MINUTES = 21;   // display only, shown to the guest
export const JAYAB_PAY_WINDOW_MINUTES = 10;         // after host acceptance
export const JAYAB_OFFER_WINDOW_MINUTES = 10;
export const JAYAB_SUBSCRIPTION_WINDOW_MINUTES = 10;
export const JAYAB_IVR_DELAY_MINUTES = 5;
```

---

## RS-1.3 — تشخیص دستهٔ آگهی

فایل جدید `Back/src/property-reserve/common/helpers/reserve-flow.helper.ts`:

```ts
export enum ReserveFlow { DIRECT = 1, RENEW_INVITE = 2, JAYAB = 3 }
export enum BookingMode { NORMAL = 1, COMMISSION_ONLY = 2 }

export function resolveReserveFlow(
  p: Pick<Property, 'booking_mode' | 'subscription_expired_at' | 'is_authorized'>,
  jayabEnabled: boolean,
): ReserveFlow {
  const hasSubscription = !!p.subscription_expired_at && p.subscription_expired_at >= startOfToday();
  if (jayabEnabled && p.booking_mode === BookingMode.COMMISSION_ONLY) return ReserveFlow.JAYAB; // cat 4 (P3)
  if (hasSubscription) return ReserveFlow.DIRECT;                                                // cat 1
  if (jayabEnabled && p.is_authorized) return ReserveFlow.JAYAB;                                 // cat 3
  return ReserveFlow.RENEW_INVITE;                                                               // cat 2
}
```

شرط اشتراک همان شرط موجود است (`Back/src/property-reserve/roles/user/user.service.ts:220`). وقتی `subscription_expired_at` خالی است، آگهی بدون اشتراک حساب می‌شود. مقدار `jayabEnabled` وقتی `SMS_IR_LINE_NUMBER` خالی است همیشه `false` است (RS-2.1).

تست واحد `reserve-flow.helper.spec.ts` باید هر چهار دسته، سوئیچ خاموش، `subscription_expired_at = null` و اشتراکی که امروز منقضی می‌شود را پوشش دهد.

---

## RS-1.4 — ذخیرهٔ مسیر، سهم میزبان و کمیسیون در ثبت درخواست

در متد `create` در `Back/src/property-reserve/roles/user/user.service.ts` (خطوط ۶۵ تا ۱۱۴):

- بعد از خواندن `property` (خط ۷۱)، `resolveReserveFlow` با مقدار سوئیچ (RS-1.5) صدا زده شود.
- برای `flow = JAYAB`، از `quotedTotal` (خط ۸۵) مقادیر `host_share` و `commission` با فرمول README محاسبه و همراه `flow` ذخیره شوند.
- `reply_token` فقط برای JAYAB ساخته شود: ۱۰ حرف base62 با `crypto.randomBytes`.

**`ACTIVE_RESERVE_QUERY`** (خط ۳۷) امروز فقط `expired_at` و `canceled_at` را چک می‌کند.
- شرط `status: { notIn: TERMINAL_STATUSES }` اضافه شود تا رزرو قطعی، ردشده یا لغوشده جزو سقف ۳ درخواست فعال مهمان (`canCreateReserves`، خط ۵۵) و `checkActiveReserveOnProperty` (خط ۴۳) حساب نشود.
- هر انتقال به ۱۰۰، ۱۱۰، ۱۲۰، ۱۳۰ یا ۱۴۰ همچنین `expired_at = now` را تنظیم کند تا `countAllActive` مالک (`Back/src/property-reserve/roles/owner/owner.service.ts:106`) درست بماند.

---

## RS-1.5 — تنظیمات و سوئیچ کلی

کلیدهای `RESERVE_JAYAB_FLOW_ENABLED`، `RESERVE_COMMISSION_PERCENT` و `RESERVE_ESCALATE_AFTER_MINUTES` به `SettingKey` در `Back/src/setting/common/interfaces/settings.interface.ts` اضافه شوند.

`setting.get()` موجود (`Back/src/setting/roles/admin/admin.service.ts:104`) وقتی ردیف نباشد خطا می‌دهد. یک متد `getReserveSettings()` مثل `isGuestChatEnabled` (خط ۸۴) با memo پنج‌ثانیه‌ای اضافه شود. اگر ردیف نبود، مقدار امن `{ enabled: false, commissionPercent: 20, escalateAfterMinutes: 15 }` برگردد.

---

## RS-1.6 — `ReserveFlowService`: تنها جای تغییر وضعیت

فایل جدید `Back/src/property-reserve/common/services/reserve-flow.service.ts` که در `property-reserve.module.ts` ثبت و export می‌شود:

```ts
transition(
  reserveId: number,
  to: PropertyReserveStatus,
  opts: { from: PropertyReserveStatus[]; actor: 'SYSTEM'|'HOST'|'GUEST'|'ADMIN'; adminId?: number;
          action: string; data?: object; patch?: Prisma.PropertyReserveUpdateInput; isResponse?: boolean },
  tx?: Prisma.TransactionClient,
): Promise<PropertyReserve | null>

markFirstResponse(reserveId: number, actor, action, tx?): Promise<void> // sets first_response_at only if null
log(reserveId: number, actor, action, data?, adminId?, tx?): Promise<void>
```

- `transition` با `updateMany({ where: { id, status: { in: from } } })` اتمیک است. اگر `count === 0` بود `null` برمی‌گرداند و چیزی نمی‌نویسد. این جلوی دو تغییر همزمان را می‌گیرد، مثل جواب پیامکی و کلیک لینک در یک ثانیه.
- در همان تراکنش یک ردیف `PropertyReserveLog` می‌نویسد. برای وضعیت‌های پایانی منفی `expired_at` را تنظیم می‌کند (RS-1.4).
- اگر `isResponse` برقرار بود، `first_response_at` را با شرط `first_response_at IS NULL` تنظیم می‌کند.
- **چه چیزی «اولین پاسخ» حساب می‌شود:** جواب ۱ یا ۲ میزبان از هر کانال (RS-2.3)، و هر اقدام پشتیبان روی رزرو، یعنی شروع تماس، ثبت تماس با مهمان، پیامک «در حال پیگیری» و ثبت جواب تلفنی میزبان (RS-5.4). ارجاع خودکار سیستم (P1) پاسخ نیست.

همهٔ فازهای بعدی **فقط** از این سرویس برای تغییر وضعیت استفاده می‌کنند. تست واحد: انتقال از وضعیت غیرمجاز `null` برگرداند و لاگ ننویسد. `markFirstResponse` بار دوم زمان اول را عوض نکند.

---

## RS-1.7 — سوئیچ «فقط رزرو از جایاب» برای مالک و ادمین

- **DTO مالک:** `UpdatePropertyPriceOwnerDto` (`Back/src/property/roles/owner/dto/update-property.dto.ts:345`) فیلد اختیاری `booking_mode?: 1 | 2` با `@_IsEnum([1, 2])` بگیرد. `updatePrices` (`Back/src/property/roles/owner/owner.service.ts:240`) اگر مقدار آمده بود ذخیره‌اش کند. این مرحلهٔ «ظرفیت و قیمت» Front است (RS-4.1).
- **انتخاب قانون کنسلی برای دستهٔ ۴ اجباری است.** `canceling_type` در مرحلهٔ قوانین (`Back/src/property/roles/owner/dto/update-property.dto.ts:432-436`) از قبل اجباری است. آگهی بدون `canceling_type` در `resolveReserveFlow` به JAYAB نمی‌رسد و یک warning لاگ می‌شود، چون بدون قانون کنسلی، لغو بعد از پرداخت قابل محاسبه نیست (HW-06).
- **خروجی:** `booking_mode` در `findOne` مالک و در serializer عمومی آگهی (`Back/src/property/serializer/property.serializer.ts`، کنار `is_authorized` در خط ۳۰۳) قرار بگیرد. یک فیلد محاسبه‌شدهٔ `jayab_booking: boolean` هم اضافه شود که برابر `resolveReserveFlow(...) === JAYAB` است. Front شرط را تکرار نمی‌کند.
- **ادمین:** model-props آگهی در `Back/src/property/common/helpers/model-props-builder.helper.ts` ستون و فیلتر «روش رزرو» بگیرد. تغییر آن توسط ادمین در RS-5.8 است.
- **cache:** کلید `contact:${code}` در Redis بعد از تغییر `booking_mode` پاک شود، مثل `Back/src/property/roles/owner/owner.service.ts:299`.

---

## RS-1.8 — نوع اعلان‌های پنل

در `Back/src/firebase/constants/notif-types.ts`:

```ts
RESERVE_NEEDS_FOLLOW_UP = 'ReserveNeedsFollowUp',
RESERVE_PAID = 'ReservePaid',
RESERVE_REFUND_REQUIRED = 'ReserveRefundRequired',
```

هر سه با عنوان فارسی به `NotificationPermissionList` اضافه شوند (id های ۸ تا ۱۰). ارسال با `NotificationSharedService.createNotification({ user: { role: UserRole.ADMIN }, ... })` انجام می‌شود (`Back/src/notification/roles/shared/shared.service.ts:67`) که فقط به ادمین‌های دارای آن مجوز می‌رسد.

---

## اثرهای جانبی و کارایی

- ایندکس `(flow, status)` برای صف پشتیبانی و job خواندن پیامک است.
- `jayab_booking` در serializer لیست‌ها فقط از فیلدهای همان رکورد و memo سوئیچ محاسبه می‌شود، بدون کوئری اضافه.
- رفتار مسیرهای DIRECT و RENEW_INVITE تغییر نمی‌کند. `Back/src/property-reserve/roles/user/user-reservation.spec.ts` باید بدون تغییر پاس شود.

## معیار پذیرش فاز

- [ ] migration و seeder طبق RS-1.1. ردیف ۱۵ در `NEW-APP-DEPLOYMENT.md` ثبت شده است.
- [ ] با سوئیچ خاموش، درخواست هر آگهی `flow` برابر ۱ یا ۲ دارد و پیامک، تماس و انقضا مثل قبل است.
- [ ] با سوئیچ روشن در محیط تست: آگهی احرازشدهٔ بدون اشتراک → `flow = 3`، `host_share = 0.8 × total`، `commission = total - host_share` و `reply_token` ده‌حرفی.
- [ ] مالک `booking_mode` را ذخیره می‌کند و `jayab_booking` درست برمی‌گردد. آگهی بدون قانون کنسلی JAYAB نمی‌شود.
- [ ] `yarn lint`، `yarn test` و `tsc --noEmit` پاس می‌شوند.
