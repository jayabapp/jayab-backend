# ۰۲ — جواب میزبان و تایمرها (Back)

**وابستگی:** فاز ۰۱، و PRE-1 و PRE-3. **پیش‌نیاز روشن کردن سوئیچ:** بله.
**خروجی:** پیامک میزبان از خط اختصاصی، خواندن و تطبیق پیامک‌های دریافتی، لینک امضاشده، endpoint اپ مالک، متد واحد `hostReply`، ثبت «اولین پاسخ»، ارجاع خودکار به پشتیبانی، مهلت پرداخت ۱۰ دقیقه و بستن خودکار در روز ورود.

```
پیامک «۱» ─────┐
کلید تلفن ─────┤
لینک ──────────┼──> ReserveReplyService.hostReply(reserveId, answer, via) ──> transition(10|50 → 40 | 50 | 110)
اپ مالک ───────┤                                                            + markFirstResponse
پشتیبان (تلفنی) ┘
```

**قاعدهٔ تایمرها (تصمیم کارفرما):** ۲۱ دقیقه فقط وعدهٔ نمایشی به مهمان است و با اولین پاسخ متوقف می‌شود. هیچ‌چیز با رسیدن به دقیقهٔ ۲۱ منقضی نمی‌شود. تنها مهلت سخت، ۱۰ دقیقهٔ پرداخت بعد از تأیید میزبان است. برای حفظ وعده، درخواستی که تا دقیقهٔ ۱۵ هیچ پاسخی نگرفته خودکار به پشتیبانی ارجاع می‌شود (P1).

---

## RS-2.1 — پیامک میزبان از خط اختصاصی

**`Back/src/sms/sms.service.ts`:** متد `sendFromLine(mobile: string, text: string): Promise<void>`
- `POST https://api.sms.ir/v1/send/bulk` با بدنهٔ `{ lineNumber, messageText, mobiles: [mobile], sendDateTime: null }` و هدر `X-API-KEY`.
- گارد `isProduction` و `try/catch` با `logger.error`، مثل بقیهٔ متدهای همین فایل.

**`Back/src/config/configuration.ts` (بخش `sms`، خطوط ۴۵ تا ۶۲):**
- `lineNumber: process.env.SMS_IR_LINE_NUMBER`
- `bulkUrl: 'https://api.sms.ir/v1/send/bulk'`
- `receiveUrl: 'https://api.sms.ir/v1/receive/latest'`
- شناسهٔ ۸ قالب PRE-2

**`configuration-validation.ts`:** همهٔ متغیرهای جدید `Joi.string().optional()` باشند. اگر `SMS_IR_LINE_NUMBER` خالی باشد، `resolveReserveFlow` هیچ آگهی‌ای را JAYAB نمی‌کند و یک warning هنگام شروع برنامه لاگ می‌شود.

**`sendReserveSms`** (`Back/src/property-reserve/roles/user/user.service.ts:203`): برای `flow = JAYAB` به جای `sendReserveToOwner` متن زیر با `sendFromLine` به شمارهٔ کاربرِ مالک فرستاده شود و لاگ `SMS_SENT` ثبت شود. شمارهٔ مهمان در پیامک **نیست**.

```
جایاب | درخواست رزرو {id}
«{title تا ۳۸ حرف}»
{date} ({nights} شب، {guests} نفر)
مبلغ کل: {total} تومان
سهم شما: {host_share} تومان
تأیید: ۱   رد یا تغییر شرایط: ۲
یا: {WEBSITE_URL}/r/{reply_token}
```

- `{date}` با همان قالب فعلی ساخته شود (خطوط ۲۲۶ تا ۲۳۳). اعداد فارسی با `toLocaleString('fa-IR')` باشند.
- `WEBSITE_URL` همان متغیر موجود است (`url.websiteUrl` در `Back/src/config/configuration.ts:16`).

---

## RS-2.2 — خواندن پیامک‌های دریافتی

فایل جدید `Back/src/sms/sms-inbound.service.ts` که در `SmsModule` ثبت می‌شود:

- `@Interval(15_000)` از `@nestjs/schedule` (`app.module.ts:151`). فقط وقتی کار کند که سوئیچ روشن و `lineNumber` تنظیم شده باشد.
- **قفل:** با Redis (`SET sms-inbound-lock 1 NX EX 14`) فقط یک worker در هر دوره اجرا شود، چون `app-cluster` چند worker دارد.
- `GET receiveUrl?count=100`. برای هر آیتم:
  1. ردیف `SmsInbound` با `receive_id = ReceiveReturnId` درج شود. خطای یکتایی P2002 یعنی قبلاً پردازش شده است.
  2. فقط پیامک‌هایی که `Number` برابر خط ماست و در ۲۴ ساعت اخیر رسیده‌اند پردازش شوند.
  3. تجزیه و تطبیق (پایین) انجام و `result` و `reserve_id` به‌روز شوند.

**تجزیه** (تابع خالص `parseHostReply(text)` در `Back/src/sms/helpers/parse-host-reply.ts`):
- ارقام فارسی و عربی به لاتین تبدیل شوند.
- الگو: `^\s*([12])(?:[\s\-_,.]+(\d{1,10}))?\s*$`.
- هر متن دیگری `null` است.

**تطبیق:**
- `Mobile` به قالب `09xxxxxxxxx` تبدیل و `User` با `owner_id` پیدا شود. اگر پیدا نشد → `UNKNOWN_SENDER` و بدون پاسخ.
- رزروهای قابل جواب این مالک با `canReceiveHostReply` (RS-2.3) پیدا شوند.
- اگر `reserveId` در متن آمده باید در همین فهرست باشد.
- اگر نیامده و فقط یک رزرو هست → همان. اگر چند رزرو هست → `AMBIGUOUS` و پیامک از خط: «چند درخواست باز دارید. عدد را همراه کد درخواست بفرستید، مثلاً «۱ {id}». کدها: {ids}».
- اگر هیچ رزروی نیست → `LATE` و پیامک «این درخواست دیگر منتظر جواب شما نیست.»
- متن نامعتبر از میزبانی با رزرو باز → `INVALID` و پیامک راهنما.
- هر شماره حداکثر ۳ پیامک خودکار در ساعت بگیرد. شمارش از `SmsInbound` انجام می‌شود.

---

## RS-2.3 — `ReserveReplyService.hostReply`

فایل جدید `Back/src/property-reserve/common/services/reserve-reply.service.ts`:

```ts
canReceiveHostReply(r): boolean
  // status = 10, or status = 50 with host_reply = null and support_reason = null (auto-escalated, not handled yet)
  // and check_in is still in the future

hostReply(reserveId: number, answer: 1 | 2, via: 'SMS'|'IVR'|'LINK'|'APP'|'SUPPORT', adminId?: number):
  Promise<{ outcome: 'ACCEPTED' | 'NEEDS_FOLLOW_UP' | 'DATES_TAKEN' | 'ALREADY_ANSWERED' | 'CLOSED'; reserve }>
```

- اگر `canReceiveHostReply` برقرار نیست: اگر `host_reply` پر است → `ALREADY_ANSWERED`، وگرنه → `CLOSED`. فقط لاگ `DUPLICATE_ANSWER` ثبت می‌شود.
- هر جواب معتبر با `isResponse: true` منتقل می‌شود، پس `first_response_at` پر و وعدهٔ ۲۱ دقیقهٔ مهمان متوقف می‌شود.
- **جواب ۱:**
  1. با `findBlockedNights` (RS-2.4)، با کنار گذاشتن خود این رزرو، آزاد بودن تاریخ‌ها بررسی شود. اگر آزاد نبودند → `[10, 50] → 110` با `DATES_TAKEN`، پیامک `RESERVE_CLOSED_GUEST` و job آگهی مشابه.
  2. در غیر این صورت `pay_deadline_at = now + JAYAB_PAY_WINDOW_MINUTES` (۱۰ دقیقه). انتقال `[10, 50] → 40` با `host_reply`، `host_reply_via` و `host_replied_at`.
  3. پیامک `RESERVE_PAY_LINK` به مهمان با لینک `{WEBSITE_URL}/profile/reserves?pay={id}` و اعلان داخل اپ با نقش USER.
  4. `RESERVE_EXPIRE_JOB` با تأخیر ۱۰ دقیقه اضافه شود (RS-2.6).
- **جواب ۲:** انتقال `[10, 50] → 50` با فیلدهای جواب (`50 → 50` فقط فیلدها و لاگ را تغییر می‌دهد). اعلان ادمین `RESERVE_NEEDS_FOLLOW_UP`.
- **پیامک تأیید** برای کانال SMS از خط فرستاده شود:
  - جواب ۱: «جواب شما ثبت شد. بعد از پرداخت مهمان رزرو قطعی می‌شود.»
  - جواب ۲: «جواب شما ثبت شد. پشتیبانی جایاب به‌زودی با شما تماس می‌گیرد.»
- `via = 'SUPPORT'` زمانی است که پشتیبان جواب تلفنی میزبان را ثبت می‌کند (RS-5.4). در این حالت `actor = ADMIN` و `adminId` ثبت می‌شود.

تست‌های واحد: دو جواب همزمان فقط یک انتقال، جواب ۱ با تاریخ گرفته‌شده → ۱۱۰، جواب روی رزرو ارجاع‌شده (۵۰ بدون جواب) پذیرفته شود، و `pay_deadline_at` دقیقاً ۱۰ دقیقه بعد از جواب باشد.

---

## RS-2.4 — بررسی دسترس‌بودن با قفل موقت

متد جدید در `Back/src/property/roles/user/user.service.ts`. این متد در ماژول property قرار می‌گیرد تا وابستگی حلقوی پیش نیاید:

```ts
findBlockedNights(propertyId: number, from: Date, to: Date, excludeReserveId?: number): Promise<Date[]>
```

شب‌هایی برگردانده می‌شوند که یکی از این شرط‌ها را دارند:
- (الف) `PropertyCalendar.is_reserved = true`
- (ب) زیر رزرو JAYAB با `status IN (40, 70)` و `pay_deadline_at > now()` هستند. برای ۷۰ از `offer_*` و برای ۴۰ از `check_in` و `check_out` استفاده شود، با بازهٔ `[in, out)`.
- (ج) زیر رزرو JAYAB با `status = 90` هستند (فاز ۰۳)، تا تقویم و رزرو قطعی هرگز از هم جدا نشوند.

**جایگزین این سه بررسی فعلی می‌شود:**
- شمارش `is_reserved` در `create` رزرو (`Back/src/property-reserve/roles/user/user.service.ts:80-83`)
- `unavailableDates` در `quote` (`Back/src/property/roles/user/user.service.ts:1232`)
- `findPropertyReservedDays` (همان فایل، خط ۱۲۲۱) که تقویم صفحهٔ آگهی از آن می‌خواند (`Front/features/properties/hooks/useReservedDates.ts`). Front تغییری نمی‌خواهد.

قفل با گذشت زمان خودش منقضی می‌شود و پاک‌سازی لازم نیست.

---

## RS-2.5 — لینک عمومی و endpoint اپ

**کنترلر جدید** `Back/src/property-reserve/roles/host-link/host-link.controller.ts`، مسیر `reserve-reply`، بدون گارد JWT و با `@Throttle({ default: { limit: 20, ttl: 60_000 } })`:

| متد | مسیر | خروجی |
| --- | --- | --- |
| GET | `/api/v1/reserve-reply/:token` | `{ id, property: { title, city }, check_in, check_out, nights, guests_count, quoted_total, host_share, waiting_minutes, state: 'OPEN'│'ANSWERED'│'CLOSED', host_reply }` |
| POST | `/api/v1/reserve-reply/:token` | بدنه `{ answer: 1│2 }` → خروجی `hostReply(..., 'LINK')` به شکل GET |

- لینک تا وقتی `canReceiveHostReply` برقرار است کار می‌کند. هیچ مهلت ۲۱ دقیقه‌ای ندارد.
- `waiting_minutes` تعداد دقیقه‌هایی است که مهمان منتظر بوده است. صفحه آن را نمایش می‌دهد تا میزبان عجله کند.
- token نامعتبر → 404. بعد از بسته شدن، POST خطای 410 می‌دهد.
- **هیچ اطلاعات شخصی مهمان برگردانده نمی‌شود.**

**اپ مالک** (`Back/src/property-reserve/roles/owner/owner.controller.ts`): `POST :propertyReserveId/reply` با بدنهٔ `{ answer: 1 | 2 }`. **حتماً** بررسی شود که `reserve.property.owner_id === req.user.owner_id`، وگرنه 403 با `RESERVE4`.

**لیست رزروهای مالک** (`Back/src/property-reserve/roles/owner/owner.service.ts:36`) برای `flow = 3` این فیلدها را برگرداند:
- `jayab: true`
- `can_reply`
- `waiting_minutes`
- `host_share`

شمارهٔ مهمان تا وضعیت ۹۰ برگردانده نشود (P6).

---

## RS-2.6 — تایمرها در صف موجود

**`Back/src/property-reserve/roles/user/user.controller.ts`، متد `submit` (خطوط ۵۸ تا ۶۹):** برای `flow = 3`، تأخیر `RESERVE_EXPIRE_JOB` برابر `RESERVE_ESCALATE_AFTER_MINUTES` (۱۵) است. برای بقیه همان `RESERVE_TTL_MINUTES` می‌ماند. نام jobها عوض نمی‌شود و شاخه‌بندی داخل سرویس انجام می‌شود:

| job | مسیرهای فعلی | `flow = 3` |
| --- | --- | --- |
| `RESERVE_SMS_JOB` | بدون تغییر | RS-2.1 |
| `RESERVE_CALL_JOB` (۵ دقیقه) | بدون تغییر | فقط اگر هنوز `host_reply = null`: `quickCall` با `AVANAK_RESERVE_REPLY_MESSAGE_ID` و لاگ `IVR_CALLED`. سکوت ساعت ۰ تا ۸ (خط ۲۴۹) حفظ شود. |
| `RESERVE_EXPIRE_JOB` | بدون تغییر (`expired_at = now`) | «تیک» عمومی رزرو: جدول پایین |
| `RESERVE_RECOMMENDATION_JOB` | بدون تغییر | فقط وقتی وضعیت نهایی ۱۱۰ با `DATES_TAKEN`، `HOST_UNREACHABLE` یا `CHECKIN_PASSED`، یا ۱۲۰ باشد |

**`expireReserve` برای `flow = 3`** (`Back/src/property-reserve/roles/user/user.service.ts:273`). این متد الان بدون شرط `expired_at` را تنظیم می‌کند. برای JAYAB به یک «تیک» تبدیل می‌شود که از روی وضعیت و زمان تصمیم می‌گیرد:

| وضعیت فعلی | کار |
| --- | --- |
| 10 و `first_response_at = null` | انتقال به ۵۰ با `NO_REPLY_ESCALATED`، `escalated_at = now` و اعلان `RESERVE_NEEDS_FOLLOW_UP` (P1). **منقضی نمی‌شود.** |
| 10 و `first_response_at` پر (پشتیبان قبلاً اقدام کرده) | کاری انجام نشود |
| 40 یا 70 و `pay_deadline_at > now` | job با تأخیر `pay_deadline_at - now` دوباره اضافه شود |
| 40 یا 70 با پرداختی که در ۱۰ دقیقهٔ اخیر ساخته شده و `INIT` یا `PENDING` است | یک بار با تأخیر ۳ دقیقه دوباره اضافه شود (`EXPIRE_DEFERRED_PAYMENT_IN_PROGRESS`) |
| 40 یا 70، بقیهٔ حالت‌ها | انتقال به ۱۱۰ با `UNPAID` و پیامک `RESERVE_UNPAID_HOST`. هیچ طلبی ثبت نمی‌شود. |
| 60 با علت ۶ یا ۷ (job پایان روز، فاز ۰۵) | انتقال به ۱۱۰ با `END_OF_DAY` |
| 80 و مهلت گذشته (فاز ۰۷) | برگشت به ۶۰ با `SUBSCRIPTION_OFFER_EXPIRED` |
| بقیه | کاری انجام نشود |

**بستن در روز ورود (P2):** یک `@Cron` ساعتی در `Back/src/tasks/tasks.service.ts` رزروهای `flow = 3` با `status ∈ {10, 50, 60}` را که ساعت ورودشان رسیده است (`check_in` با `check_in_hour` آگهی، و ۱۴:۰۰ اگر خالی است) به ۱۱۰ با `CHECKIN_PASSED` می‌برد. پیامک `RESERVE_CLOSED_GUEST` و آگهی مشابه هم فرستاده می‌شوند.

**لغو توسط مهمان قبل از پرداخت** (`cancel` در `Back/src/property-reserve/roles/user/user.controller.ts:141`): برای `flow = 3` با `transition` از `[10, 40, 50, 60, 70, 80]` به ۲۰ انجام شود. لغو بعد از پرداخت (۹۰) در HW-06 بستهٔ کیف پول است و از endpoint جدا انجام می‌شود.

---

## RS-2.7 — کلید تلفن (شرطی، بعد از PRE-3)

اگر حساب آوانک سرویس تعاملی دارد:
- شناسهٔ تماس در لاگ `IVR_CALLED` ذخیره شود.
- یک job با تأخیر ۲ دقیقه گزارش آن تماس را بخواند و کلید ۱ یا ۲ را به `hostReply(..., 'IVR')` بدهد.

در غیر این صورت این تحویل انجام نمی‌شود و تماس فقط یادآوری است.

---

## امنیت

- token لینک ۱۰ حرف base62 از `crypto.randomBytes` است و endpoint محدودیت تعداد درخواست دارد.
- پیامک دریافتی فقط از شمارهٔ کاربرِ مالکِ همان آگهی اثر دارد. متن خام در لاگ برنامه چاپ نمی‌شود.
- بعد از پیاده‌سازی `/security-review` اجرا شود.

## معیار پذیرش فاز

- [ ] با سوئیچ روشن روی jayab.org: پیامک از خط اختصاصی با لینک می‌رسد. «۲» در کمتر از ۳۰ ثانیه وضعیت را ۵۰ و `first_response_at` را پر می‌کند و پیامک تأیید برمی‌گردد.
- [ ] «۱» → ۴۰ با `pay_deadline_at` دقیقاً ۱۰ دقیقه بعد. بدون پرداخت → ۱۱۰ و پیامک به میزبان.
- [ ] بدون هیچ پاسخی تا دقیقهٔ ۱۵ → ۵۰ با `NO_REPLY_ESCALATED`. رزرو منقضی نمی‌شود و میزبان هنوز می‌تواند با «۱» تأیید کند.
- [ ] «۱ {id}» از میزبانی با دو درخواست باز فقط همان را تأیید می‌کند. «۱» تنها پیامک راهنما برمی‌گرداند.
- [ ] تقویم و `quote` تاریخ‌های قفل‌شده را تا پایان ۱۰ دقیقه پر نشان می‌دهند و بعد آزاد می‌شوند.
- [ ] مالک دیگر روی `POST /owner/reserves/:id/reply` خطای 403 می‌گیرد.
- [ ] تست‌های `parseHostReply`، تطبیق و `hostReply` پاس می‌شوند.
