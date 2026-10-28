# ۰۴ — صفحه‌های میزبان و مهمان (Front)

**وابستگی:** قرارداد فازهای ۰۲ و ۰۳. **پیش‌نیاز روشن کردن سوئیچ:** بله.
**خروجی:** سوئیچ «فقط رزرو از جایاب» در ثبت ملک، صفحهٔ لینک پیامک `/r/:token`، دکمه‌های جواب در رزروهای مالک، وعدهٔ ۲۱ دقیقه و پرداخت ۱۰ دقیقه‌ای در رزروهای مهمان، برچسب «رزرو با جایاب» در صفحهٔ آگهی و پنهان کردن شماره برای دستهٔ ۴. صفحه‌های کیف پول، شبا و لغو بعد از پرداخت در بستهٔ کیف پول هستند (HW-03، HW-04، HW-06).

**قواعد طراحی:** طبق `CLAUDE.md` ریشه و `Front/CLAUDE.md`. از توکن‌ها و کلاس‌های `Front/styles/globals.css` و `Front/tailwind.config.ts` استفاده کنید و مقدار دلخواه (`text-[17px]` و مشابه) اضافه نکنید. فونت IRANSansX، `dir` درست و حالت روشن و تاریک با همان توکن‌ها رعایت شود. نمونهٔ چیدمان در بخش «آنچه میزبان و مهمان می‌بینند» [Artifact](https://claude.ai/artifact/ASq6iXnCYhMsyovAYbSZvD) است. فونت و رنگ آن نمونه مرجع نیستند.

**API:** متدهای جدید به `Front/api_services/reserve/reserve.service.ts` با الگوی `apiCall` اضافه شوند. مسیرها در `Front/utils/urls.ts` کنار `OWNER_RESERVE` (خط ۱۶۱) و typeها در `api_services/reserve/*.interface.ts` تعریف شوند. اگر endpointها در `openapi/` تولید می‌شوند، `yarn api:generate` و `yarn api:check` اجرا شود.

---

## RS-4.1 — سوئیچ «فقط رزرو از جایاب» در مرحلهٔ ظرفیت و قیمت

- **فایل:** `Front/components/modules/OwnerPropertyEditor/PropertyPriceStep.client.tsx`، مرحلهٔ «ظرفیت و قیمت» (`Front/utils/constantss.ts:129`، مسیر `/edit/price`).
- یک checkbox از `@elements/Form` (پوشهٔ `Checkbox/`) با عنوان «فقط رزرو از جایاب (کمیسیونی)» و `CmsInfoPopup` با این متن: «مهمان‌ها فقط از طریق جایاب رزرو و پرداخت می‌کنند. شمارهٔ شما در آگهی نمایش داده نمی‌شود و جایاب ۲۰٪ مبلغ هر رزرو را به‌عنوان کمیسیون برمی‌دارد. لغو رزرو طبق قانون کنسلی‌ای انجام می‌شود که در مرحلهٔ قوانین انتخاب کرده‌اید.»
- `booking_mode` به `toPriceValues`، `emptyPriceValues` (`Front/features/owner-property/mappers/property-draft.mapper.ts`) و type `PricingPropertySendDto` اضافه شود.
- اگر آگهی هنوز قانون کنسلی ندارد، کنار checkbox پیام «اول در مرحلهٔ قوانین، قانون کنسلی را انتخاب کنید» با لینک به `/edit/terms` نمایش داده شود (RS-1.7).

---

## RS-4.2 — جواب میزبان در رزروهای مالک

- **فایل‌ها:** `Front/components/modules/OwnerReservations/OwnerReservationList.client.tsx` و `Front/components/modules/ReservationDetails/ReservationCard.client.tsx` با بخش‌های `parts/` آن.
- **وقتی `reservation.jayab` برقرار است:**
  - برچسب «رزرو با جایاب» و سطر «سهم شما: {host_share} تومان» نمایش داده شود.
  - **اگر `can_reply` برقرار است:**
    - متن «مهمان {waiting_minutes} دقیقه است منتظر جواب شماست» (به‌روز در هر دقیقه).
    - دکمه‌های «تأیید رزرو» (اصلی) و «رد یا تغییر شرایط» (ثانویه با تأیید کوتاه داخل کارت).
    - **شمارندهٔ معکوس برای میزبان وجود ندارد**، چون ۲۱ دقیقه مهلت میزبان نیست.
  - mutation جدید `useHostReply` در `Front/features/reservations/hooks/` که `POST owner/reserves/:id/reply` را صدا می‌زند و `reservationKeys.owners()` را invalidate می‌کند، مثل `useMarkReserveSeen`.
  - شمارهٔ مهمان تا ۹۰ نمایش داده نشود. منطق فعلی `is_subscription_expired` (خطوط ۶۱ و ۸۶ کارت) برای کارت JAYAB اجرا نشود.
  - **بعد از جواب:**
    - ۴۰: «منتظر پرداخت مهمان (۱۰ دقیقه)»
    - ۵۰ و ۶۰: «پشتیبانی جایاب با شما تماس می‌گیرد»
    - ۹۰: «رزرو قطعی شد. سهم شما در کیف پول جایاب ثبت شد» با لینک به کیف پول (HW-04)
- کارت بدون `jayab` دقیقاً مثل قبل رندر شود.

---

## RS-4.3 — صفحهٔ لینک پیامک `/r/:token`

- **مسیر:** `Front/app/(pages)/r/[token]/page.tsx`. یک segment ثابت است و با `[slug]` تک‌بخشی موجود تداخل ندارد.
- ورود نمی‌خواهد، چون token مجوز است. `robots: { index: false }` داشته باشد و در sitemap نیاید.
- `GET` و `POST /reserve-reply/:token` با `apiCall` و از طریق proxy فرانت صدا زده شوند.
- **محتوا:**
  - عنوان اقامتگاه، شهر، تاریخ‌ها، شب‌ها، نفرات، مبلغ کل و سهم میزبان (برجسته).
  - متن «مهمان {waiting_minutes} دقیقه است منتظر جواب شماست».
  - دو دکمهٔ تمام‌عرض «۱ · تأیید رزرو» و «۲ · رد یا تغییر شرایط» در `FixedBottomContainer`. بعد از کلیک تا رسیدن جواب غیرفعال شوند.
- **حالت‌ها:**

| state | نمایش |
| --- | --- |
| `OPEN` | خلاصه و دو دکمه |
| `ANSWERED` | «جواب شما ({host_reply}) ثبت شده است» و توضیح وضعیت |
| `CLOSED` | «این درخواست دیگر منتظر جواب شما نیست» |
| 404 | «این لینک معتبر نیست» |
| 429 | «لطفاً چند لحظه بعد دوباره تلاش کنید» |

---

## RS-4.4 — وعدهٔ ۲۱ دقیقه و پرداخت در رزروهای مهمان

- **فایل‌ها:** `Front/components/modules/GuestReservations/GuestReservationList.client.tsx`، `ReservationCard` و `Front/features/reservations/api/reservation.options.ts`.
- **وعدهٔ پاسخ:**
  - وقتی `responded = false` است: «جایاب حداکثر تا ۲۱ دقیقه به شما جواب می‌دهد» با شمارندهٔ `response_promise_seconds_left`.
  - اگر شمارنده صفر شد و هنوز پاسخی نیامده: «پشتیبانی جایاب در حال پیگیری درخواست شماست». شمارنده منفی یا قرمز نشود.
  - **به محض `responded = true`، شمارنده حذف و وضعیت فرایند نمایش داده شود.**
- **وقتی `can_pay` برقرار است:**
  - بنر «میزبان رزرو را تأیید کرد» (۴۰) یا «پیشنهاد جدید جایاب» (۷۰).
  - برای ۷۰، `offer` (تاریخ‌ها، نفرات، مبلغ، یادداشت) نمایش داده شود و تغییر نسبت به درخواست اول برچسب «تغییر کرده» بگیرد.
  - مبلغ `amount_payable`، شمارندهٔ ۱۰ دقیقه‌ای `pay_seconds_left` و دکمهٔ «پرداخت و قطعی کردن رزرو».
  - mutation جدید `usePayReservation` که `POST reserves/:id/pay` را با `{ redirect_url: \`${window.origin}/profile/reserves?paid=${id}\`, gateway: process.env.NEXT_PUBLIC_PAYMENT_GATEWAY }` صدا می‌زند و با `window.location.assign(payment_url)` به درگاه می‌رود. این الگوی `Front/components/modules/OwnerPropertySubscription/OwnerPropertySubscription.client.tsx:60` است.
- **وضعیت‌های دیگر:**

| وضعیت | متن کارت |
| --- | --- |
| ۵۰، ۶۰، ۸۰ | «در حال بررسی توسط جایاب» |
| ۹۰ | «رزرو قطعی» با کد پیگیری، نام قانون کنسلی و دکمهٔ «لغو رزرو» (HW-06) |
| ۱۰۰ | «میزبان با شما تماس می‌گیرد. شمارهٔ میزبان برای شما پیامک شد» (RS-7.4) |
| ۱۱۰ و ۱۲۰ | «رزرو انجام نشد» |
| ۱۳۰ | «پرداخت انجام شد ولی تاریخ‌ها دیگر آزاد نبود. مبلغ کامل به شما برمی‌گردد» با وضعیت بازگشت وجه (HW-06) |
| ۱۴۰ | «لغو شد» با مبلغ قابل بازگشت و وضعیت بازگشت وجه (HW-06) |

- **لینک‌های پیامک:** `?pay={id}` کارت همان رزرو را با scroll و focus روی دکمهٔ پرداخت مشخص کند. `?paid={id}` بعد از برگشت از درگاه cache رزروها را invalidate کند.
- **polling:** `refetchInterval` در `userReservationsOptions` (خطوط ۹ تا ۲۲) الان فقط برای وضعیت ۱۰ است. وضعیت‌های ۴۰، ۵۰، ۶۰، ۷۰ و ۸۰ هم با همان ۳۰ ثانیه اضافه شوند.
- **منطق خالص:** نگاشت وضعیت و فیلدها به حالت UI در تابع خالص `reservationPhase(reservation)` در `Front/features/reservations/lib/` با تست `*.test.ts` باشد. این تابع قاعدهٔ توقف وعده با `responded` را هم پوشش دهد.

---

## RS-4.5 — ثبت درخواست در صفحهٔ آگهی

- **فایل‌ها:** `Front/components/modules/PropertyContact/ContactFlow.client.tsx`، `parts/ReserveConfirmSheet.client.tsx` و `parts/ReserveSuccess.client.tsx`.
- وقتی `property.jayab_booking` برقرار است:
  - عنوان دکمه و sheet «رزرو با جایاب» باشد.
  - در sheet، نام قانون کنسلی آگهی کنار مبلغ نمایش داده شود.
  - متن موفقیت: «درخواست برای میزبان ارسال شد. جایاب حداکثر تا ۲۱ دقیقه به شما جواب می‌دهد. بعد از تأیید میزبان، ۱۰ دقیقه برای پرداخت فرصت دارید.»

## RS-4.6 — پنهان کردن شماره برای دستهٔ ۴

- **Back:** `findContactInfo` (`Back/src/property/roles/user/user.service.ts:660`) برای `booking_mode = 2` فهرست خالی و `owner.mobile = null` برگرداند و `jayab_only: true` اضافه کند. پنهان کردن فقط در Front کافی نیست.
- **Front:** `PropertyContactModal` و `PropertyContactRow` با `jayab_only` دکمه‌های تماس و پیامک را نمایش ندهند و فقط مسیر رزرو را باز کنند (P4).

---

## RS-4.7 — متن‌ها

کلیدهای جدید زیر `reserve` در `Front/messages/{fa,ar,en}.json` (بلوک خط ۸۱۱ در `fa.json`):

- `jayabBadge`، `hostShare`، `hostWaiting`
- `replyAccept`، `replyReject`، `replyRejectConfirm`، `replyDoneAccepted`، `replyDoneFollowUp`
- `linkInvalid`، `linkClosed`، `linkAnswered`
- `responsePromise`، `responsePromiseOver`
- `payNow`، `payDeadline`، `hostAccepted`، `newOffer`، `offerChanged`
- `underReview`، `confirmed`، `notCompleted`، `refundRequired`، `canceledAfterPayment`، `directContact`
- `jayabOnlyLabel`، `jayabOnlyHelp`، `jayabOnlyNeedsPolicy`
- `reserveWithJayab`، `jayabRequestSent`

متن انگلیسی و عربی به همان معنی ترجمه شود.

---

## اثرهای جانبی و کارایی

- polling رزروهای مهمان فقط وقتی فعال است که کارت باز داشته باشد.
- صفحهٔ `/r/:token` سبک است و فقط دو درخواست دارد. کامپوننت‌های سنگین صفحهٔ آگهی import نشوند.
- کارت‌های مسیرهای فعلی بدون هیچ تغییر ظاهری رندر شوند.

## معیار پذیرش فاز

- [ ] مالک سوئیچ را روشن می‌کند. صفحهٔ آگهی دکمه‌های تماس را نشان نمی‌دهد و «رزرو با جایاب» دیده می‌شود.
- [ ] مهمان شمارندهٔ ۲۱ دقیقه را می‌بیند. با جواب میزبان یا اقدام پشتیبان شمارنده در کمتر از ۳۰ ثانیه حذف می‌شود. بعد از صفر شدن بدون پاسخ، متن پیگیری پشتیبانی نمایش داده می‌شود.
- [ ] بعد از تأیید میزبان، شمارندهٔ ۱۰ دقیقه و دکمهٔ پرداخت دیده می‌شوند. بعد از پرداخت در sandbox، کارت «رزرو قطعی» است.
- [ ] لینک پیامک روی موبایل در هر دو تم باز می‌شود و همهٔ حالت‌ها درست هستند.
- [ ] fa، ar و en متن کامل دارند و RTL و LTR سالم است.
- [ ] `yarn lint`، `yarn build` و `yarn test:reservations` پاس می‌شوند. بررسی responsive در ۳۶۰، ۷۶۸ و ۱۲۸۰ پیکسل انجام شود.
