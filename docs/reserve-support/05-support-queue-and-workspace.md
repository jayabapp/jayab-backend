# ۰۵ — صف و میز کار پشتیبان (Back + Panel)

**وابستگی:** فازهای ۰۱ و ۰۲. **پیش‌نیاز روشن کردن سوئیچ:** بله. بعد از deploy، PRE-4 (ساخت نقش پشتیبان) انجام شود.
**خروجی:** APIهای پشتیبانی در گروه `admin/reserve-support`، منو و صف‌ها در Panel، میز کار هر رزرو (مراحل ۳، ۴ و ۸ PDF)، «پاسخ به مهمان» برای حفظ وعدهٔ ۲۱ دقیقه، ثبت جواب تلفنی میزبان، اعلان‌ها و سابقهٔ میزبان. مراحل ۵ و ۶ PDF در فاز ۰۶، مرحلهٔ ۷ در فاز ۰۷، و کارت فقط‌خواندنی وضعیت مالی در HW-07 بستهٔ کیف پول به همین صفحه اضافه می‌شوند.

**چرا گروه مسیر جدا:** `RBACInterceptor` (سراسری در `Back/src/main.ts:57`) ماژول را از اولین بخش بعد از `/admin/` می‌خواند (`Back/src/common/interceptors/rbac.interceptor.ts:30-40`). با `admin/reserve-support` می‌شود نقشی ساخت که فقط پشتیبانی رزرو را ببیند و هیچ دسترسی مالی نداشته باشد.

---

## RS-5.1 — کنترلر و سرویس پشتیبان (Back)

**فایل‌ها:**
- `Back/src/property-reserve/roles/support/support.controller.ts`
- `support.service.ts`
- `support.module.ts` (در `property-reserve.module.ts` ثبت شود)
- `dto/*.ts`
- `SUPPORT_ROUTE_GROUP = 'admin/reserve-support'` در `Back/src/property-reserve/common/route-group.constant.ts`

گارد `AdminJwtGuard` و `@SkipThrottle()` مثل `Back/src/property-reserve/roles/admin/admin.controller.ts:22-26` است. همهٔ تغییرها از `ReserveFlowService` با `actor: 'ADMIN'` و `adminId = req.user.id` انجام می‌شوند.

| متد | مسیر | کار | وضعیت‌های مجاز | اولین پاسخ؟ |
| --- | --- | --- | --- | --- |
| GET | `/model-props` | ستون‌ها و فیلترهای صف (RS-5.2) | — | — |
| GET | `/` | صف با `tab`، `page`، `per_page` | `flow = 3` | — |
| GET | `/:id` | جزئیات کامل (RS-5.3) | همه | — |
| POST | `/:id/guest-contact` | بدنه `{ via: 'CALL' │ 'SMS' }`. CALL فقط ثبت می‌کند. SMS قالب `RESERVE_IN_PROGRESS` را به مهمان می‌فرستد. | ۱۰، ۵۰، ۶۰ | بله |
| POST | `/:id/call-started` | شروع تماس با میزبان | ۱۰، ۵۰، ۶۰ | بله |
| POST | `/:id/host-answer` | بدنه `{ answer: 1 │ 2 }`، جواب تلفنی میزبان ← `hostReply(..., 'SUPPORT')` | وقتی `canReceiveHostReply` برقرار است | بله |
| POST | `/:id/reason` | بدنه `{ reason: 1..8 }` | ۵۰ یا ۶۰، به شرط `support_called_at` | بله |
| POST | `/:id/calls` | بدنه `{ party: 'GUEST' │ 'HOST' }` | ۹۰، ۱۳۰، ۱۴۰ | — |
| POST | `/:id/finalize` | بدنه `{ note: string }` | ۹۰ (هر دو تماس ثبت شده باشد)، ۱۳۰ و ۱۴۰ (فقط یادداشت) | — |
| POST | `/:id/cancel` | بدنه `{ by: 'GUEST' │ 'HOST', note }`. لغو تلفنی رزرو قطعی طبق قانون کنسلی. منطق و مبلغ از بستهٔ کیف پول، HW-6.3. | ۹۰ | — |

کدهای پیام جدید Back:

| کد | پیام | HTTP |
| --- | --- | --- |
| `RESERVE_SUPPORT_STATE` | این اقدام در وضعیت فعلی رزرو ممکن نیست | 422 |
| `RESERVE_SUPPORT_CLAIMED` | همکار دیگری در حال پیگیری این رزرو است | 409 |
| `RESERVE_SUPPORT_CALL_FIRST` | اول تماس با میزبان را شروع کنید | 422 |
| `RESERVE_SUPPORT_CALLS_MISSING` | تماس با مهمان و میزبان هر دو باید ثبت شود | 422 |

---

## RS-5.2 — صف‌ها

| tab | شرط | ترتیب | نکته |
| --- | --- | --- | --- |
| `awaiting_host` | `status = 10` | قدیمی‌ترین اول | ستون «وعدهٔ مهمان» با شمارندهٔ ۲۱ دقیقه. ردیف‌هایی که بیش از ۱۰ دقیقه بی‌پاسخ مانده‌اند برچسب «در خطر» می‌گیرند. پشتیبان می‌تواند قبل از ارجاع خودکار اقدام کند. |
| `follow_up` (پیش‌فرض) | `status ∈ {50, 60, 70, 80}` | قدیمی‌ترین `escalated_at` یا `host_replied_at` اول | ارجاع‌های خودکار (`NO_REPLY_ESCALATED`) برچسب «بی‌پاسخ» دارند |
| `awaiting_payment` | `status = 40` | نزدیک‌ترین `pay_deadline_at` اول | فقط‌خواندنی |
| `to_call` | `status ∈ {90, 130, 140}` و `finalized_at = null` | قدیمی‌ترین اول | |
| `complaints` | گزارش‌های تحویل `OPEN` و `AWAITING_FINANCE` (HW-9.3) | قدیمی‌ترین اول | بیشتر از ۲۴ ساعت قرمز می‌شود. تسویهٔ میزبان تا تصمیم پشتیبان متوقف است، پس این برگه اولویت دارد. |
| `all` | `flow = 3` | جدیدترین اول | |

پاسخ لیست شامل `counts` هر برگه هم هست.

ستون‌ها از `model-props` با builderهای `Back/src/property-reserve/common/helpers/model-props-builder.helper.ts` ساخته شوند:
- کد درخواست
- اقامتگاه (عنوان و شهر)
- دسته: «۳ · احراز شده» یا «۴ · کمیسیونی»
- میزبان
- تاریخ، شب و نفر
- مبلغ کل
- وضعیت با رنگ
- کانال جواب
- وعدهٔ مهمان (پاسخ داده شده یا شمارنده)
- پشتیبان مسئول

---

## RS-5.3 — جزئیات یک رزرو

`GET /:id` در یک پاسخ برمی‌گرداند:

```ts
{
  reserve,                                   // all fields
  property: { id, code, title, city, feature_image, booking_mode, is_authorized, canceling_type,
              subscription_expired_at, std_capacity, max_capacity, daily_price },
  host:  { full_name, mobile },
  guest: { full_name, mobile },
  support_admin: { id, name } | null,
  logs: PropertyReserveLog[],                // newest first, with admin name
  host_history: { total, accepted, follow_up, no_reply, reasons: Record<reasonId, number> },
  promise: { responded: boolean, seconds_left: number | null },   // the guest's 21-minute promise
  actions: { guest_contact, call, host_answer, reason, corrective, offer, subscription,
             call_guest, call_host, finalize },
  deadlines: { pay_seconds_left },
  finance: null,                             // filled by HW-07, read-only
}
```

- `actions` در سرور از روی وضعیت محاسبه می‌شود و Panel فقط دکمه‌ها را فعال یا غیرفعال می‌کند.
- `corrective`، `offer` و `subscription` تا فازهای ۰۶ و ۰۷ همیشه `false` هستند.
- `host_history` با یک `groupBy` روی رزروهای `flow = 3` همان `owner_id` ساخته شود و شامل علت‌های گروه ۲ و تعداد بی‌پاسخ‌ها باشد.

---

## RS-5.4 — منطق اقدام‌ها

- **`guest-contact`:** مهم‌ترین ابزار حفظ وعدهٔ ۲۱ دقیقه است. با `markFirstResponse` وعده را متوقف می‌کند و لاگ `GUEST_CONTACTED` با `via` ثبت می‌کند. وضعیت را تغییر نمی‌دهد.
- **`call-started`:**
  - اگر `support_admin_id` ادمین دیگری است و `support_called_at` کمتر از ۳۰ دقیقه پیش ثبت شده → 409 با نام او.
  - در غیر این صورت `support_admin_id` و `support_called_at` تنظیم، `markFirstResponse` و لاگ `CALL_STARTED`.
  - در وضعیت ۱۰ وضعیت تغییر نمی‌کند. نتیجهٔ تماس با `host-answer` ثبت می‌شود.
- **`host-answer`:** پشتیبان جوابی را که میزبان تلفنی داده ثبت می‌کند. همان `hostReply` با `via = 'SUPPORT'` است: جواب ۱ مستقیم به پرداخت ۱۰ دقیقه‌ای مهمان می‌رود و جواب ۲ به ۵۰. بعد از جواب ۲، فرم علت باز می‌شود.
- **`reason`:**

| علت | انتقال | کار بعدی |
| --- | --- | --- |
| ۱، ۲، ۳ | ← ۶۰ | کارت اقدام اصلاحی (فاز ۰۶) |
| ۴ `REJECT` | ← ۱۲۰ | پیامک `RESERVE_CLOSED_GUEST` و آگهی مشابه |
| ۵ `THOUGHT_NO_COMMISSION` | ← ۶۰ | کارت کمیسیون و اشتراک (فاز ۰۷) |
| ۶، ۷ | ← ۶۰ | job انقضا برای ساعت ۲۳:۵۹ همان روز به وقت تهران (P5) |
| ۸ `HOST_UNREACHABLE` | ← ۱۱۰ | پیامک `RESERVE_CLOSED_GUEST` و آگهی مشابه (P2) |

  `support_called_at` بعد از ثبت علت پاک می‌شود تا علت بعدی به تماس جدید نیاز داشته باشد. هر تماس فقط یک علت دارد (PDF صفحهٔ ۴).
- **`calls`:** `guest_called_at` یا `host_called_at` تنظیم و لاگ ثبت شود.
- **`finalize`:** برای ۹۰ هر دو تماس لازم است. `finalized_at` و `support_note` ذخیره و لاگ `FINALIZED` ثبت می‌شود. برای ۱۳۰ و ۱۴۰، نهایی‌سازی پشتیبانی به معنی تکمیل بازگشت وجه نیست. وضعیت بازگشت وجه در پنل مالی است (HW-06).

تست واحد سرویس: claim همزمان دو ادمین، `guest-contact` که `first_response_at` را فقط بار اول پر می‌کند، `host-answer` روی رزرو ارجاع‌شده، علت بدون تماس، و finalize بدون تماس‌ها.

---

## RS-5.5 — منو و صف در Panel

- **منو:** در `Panel/components/Sidebar/SidebarRowItems.tsx`، کنار «درخواست های رزرو» (خطوط ۳۲۵ تا ۳۳۳):
  ```tsx
  { id: 40214, title: "پشتیبانی رزرو", route: "/reserve-support",
    icon: (selected) => <Headset {...phosphoreIconProps(selected)} />, key: "reserve-support" }
  ```
  نمایش آن با دسترسی `v` همان ماژول کنترل می‌شود (`Panel/components/Sidebar/rbacSidebarItems.ts`).
- **مسیر API:** در `Panel/utils/urls.ts` کنار `RESERVES1` (خط ۱۱۶): `RESERVE_SUPPORT: "/admin/reserve-support"`.
- **صف:** `Panel/app/reserve-support/page.tsx` با الگوی `Panel/app/property-reserves/page.tsx` (جدول model-props، `TableFilter`، `Pagination`):
  - برگه‌های بالای جدول با عدد `counts`.
  - ستون وعده با شمارندهٔ زنده و رنگ نارنجی برای «در خطر».
  - «باز کردن» به `/reserve-support/show/{id}` می‌رود.
  - برگهٔ فعال هر ۳۰ ثانیه، فقط وقتی تب مرورگر فعال است، دوباره بارگذاری شود.

---

## RS-5.6 — میز کار رزرو در Panel

**مسیر:** `Panel/app/reserve-support/show/[id]/page.tsx`. بخش‌های بزرگ در `parts/` همان پوشه قرار بگیرند. الگوی دریافت و ارسال مثل `Panel/app/tickets/show/[id]/page.tsx` با `ApiCall` و `Notify` است.

**چیدمان** (مرجع: بخش «طراحی پنل» در [Artifact](https://claude.ai/artifact/ASq6iXnCYhMsyovAYbSZvD)) با کامپوننت‌ها و حالت تاریک فعلی Panel (NextUI، `shadow-card`، `rounded-10`):

1. **بنر وضعیت:** از روی وضعیت، `host_reply_via` و وعده. مثال: «بی‌پاسخ · ۱۶ دقیقه از ثبت درخواست · ارجاع خودکار».
2. **نوار وعدهٔ مهمان:** تا وقتی `promise.responded = false` است، یک نوار نارنجی با شمارنده و دکمهٔ «پیامک در حال پیگیری به مهمان» نمایش داده شود. بعد از پاسخ، به یک سطر سبز «به مهمان پاسخ داده شد · {زمان}» تبدیل شود.
3. **کارت خلاصه** (ثابت): تصویر، کد، دسته، قانون کنسلی، اقامتگاه، مهمان، میزبان، تاریخ، شب، نفر و سه کادر مبلغ.
4. **stepper شش‌مرحله‌ای:** ثبت درخواست ← پیامک میزبان ← جواب یا ارجاع ← تماس و علت ← اصلاح یا پیشنهاد ← پرداخت یا پایان.
5. **کارت اقدام بر اساس وضعیت:**

| وضعیت | کارت |
| --- | --- |
| ۱۰ | «منتظر جواب میزبان». کانال‌های ارسال‌شده از لاگ، دکمهٔ «تماس با میزبان» و بعد از آن دو دکمهٔ «میزبان تأیید کرد» و «میزبان رد کرد یا شرایط را تغییر داد» (`host-answer`). |
| ۴۰ | فقط‌خواندنی: «منتظر پرداخت مهمان» با شمارندهٔ ۱۰ دقیقه |
| ۵۰ و `!support_called_at` | شمارهٔ میزبان با دکمهٔ کپی، دکمهٔ اصلی «شروع تماس با میزبان» و بقیهٔ دکمه‌ها غیرفعال با متن «تا وقتی تماس ثبت نشود، بقیهٔ دکمه‌ها قفل‌اند». برای ارجاع خودکار، دو دکمهٔ `host-answer` هم بعد از تماس فعال می‌شوند. |
| ۵۰ یا ۶۰ و `support_called_at` | فرم علت: سه گروه radio (۴، ۳ و ۱ گزینه)، فقط یکی، بدون متن آزاد. دکمهٔ «ثبت علت و ادامه». گزینه‌های «رزرو را نمی‌پذیرم» و «عدم دسترسی به میزبان» با `ConfirmModal`. |
| ۶۰ با علت ۶ یا ۷ | «در سابقهٔ میزبان ثبت شد. درخواست تا پایان امروز باز است.» با دکمهٔ «تماس دوباره» |
| ۶۰ با علت ۱ تا ۳ یا ۵ | تا فاز ۰۶ و ۰۷: «این اقدام در نسخهٔ بعد فعال می‌شود» |
| ۹۰ | دو کادر نتیجه، دکمه‌های «ثبت تماس با مهمان» و «ثبت تماس با میزبان»، یادداشت و «نهایی‌سازی رزرو» (فقط بعد از هر دو تماس) |
| ۱۳۰ و ۱۴۰ | توضیح، شمارهٔ مهمان، وضعیت بازگشت وجه از HW-07 (فقط‌خواندنی) و یادداشت |
| بقیهٔ پایانی‌ها | فقط‌خواندنی |

6. **ستون کناری:** لاگ زمانی و «سابقهٔ میزبان».

شماره‌ها `dir="ltr"` و قابل انتخاب باشند. بعد از هر اقدام جزئیات دوباره بارگذاری شود و خطای 409 یا 422 با پیام Back نمایش داده شود.

**زبان و تم (XC-5):**
- همهٔ متن‌های صف و میز کار از `Panel/dictionary/{fa,ar,en}.json` با namespace `reserveSupport` و `useT()` خوانده می‌شوند.
- model-props برای ستون‌ها و وضعیت‌ها `title_key` برمی‌گرداند.
- صفحه در تم روشن و تاریک NextUI بررسی می‌شود و رنگ وضعیت‌ها از رنگ‌های NextUI است.
- رزروهایی که با اعتبار سازمانی پرداخت شده‌اند (OW-02) برچسب «سازمانی» با نام سازمان می‌گیرند.

---

## RS-5.7 — اعلان‌های Panel

در `Panel/components/shared/Alert/index.tsx`:
- چهار مقدار `RESERVE_NEEDS_FOLLOW_UP = "ReserveNeedsFollowUp"`، `RESERVE_PAID = "ReservePaid"`، `RESERVE_REFUND_REQUIRED = "ReserveRefundRequired"` و `RESERVE_HANDOVER_COMPLAINT = "ReserveHandoverComplaint"` (HW-9.2) به enum `NotificationType` (خطوط ۱۰ تا ۱۹) اضافه شوند.
- در `_findRoute` (خط ۶۷) هر چهار به `/reserve-support/show/${notificationableId}` بروند.
- **کارت گزارش تحویل:** میز کار برای رزرو ۹۰ کارت «گزارش مهمان دربارهٔ تحویل» و چهار تصمیم آن را دارد (HW-9.3).
- اعلان «نیاز به پیگیری» نوع `warn` دارد. اعلان ارجاع خودکار عنوان «درخواست بی‌پاسخ — وعدهٔ ۲۱ دقیقه» می‌گیرد.

## RS-5.8 — روش رزرو آگهی در Panel

- ستون و فیلتر «روش رزرو» از model-props فاز ۰۱ نمایش داده می‌شود.
- `PATCH /admin/properties/:id/booking-mode` با بدنهٔ `{ booking_mode: 1 │ 2 }` در `Back/src/property/roles/admin/admin.controller.ts` اضافه شود، با بررسی `req.adminRbac?.u` مثل خط ۲۰۸ همان فایل.
- یک کنترل ساده در `Panel/app/properties/show/[id]/page.tsx` این endpoint را صدا بزند.

---

## معیار پذیرش فاز

- [ ] نقش فقط-پشتیبان منوی «پشتیبانی رزرو» را می‌بیند و به `/admin/property-reserves` و ماژول‌های مالی خطای 403 می‌گیرد.
- [ ] درخواست تازه در برگهٔ «منتظر جواب میزبان» با شمارنده دیده می‌شود. «پیامک در حال پیگیری» وعدهٔ مهمان را متوقف می‌کند و ارجاع خودکار در دقیقهٔ ۱۵ دیگر اتفاق نمی‌افتد.
- [ ] درخواست بی‌پاسخ در دقیقهٔ ۱۵ با اعلان به «نیاز به پیگیری» می‌رود. ثبت «میزبان تأیید کرد» از تلفن، مهمان را به پرداخت ۱۰ دقیقه‌ای می‌برد.
- [ ] دو ادمین همزمان «شروع تماس» → دومی خطای 409 می‌گیرد.
- [ ] علت ۴ → ۱۲۰. علت ۸ → ۱۱۰ با پیامک و آگهی مشابه. علت ۶ تا پایان روز باز می‌ماند.
- [ ] رزرو ۹۰ تا ثبت هر دو تماس نهایی نمی‌شود.
- [ ] Back: lint، test و tsc. Panel: lint و build. سپس `/security-review`.
