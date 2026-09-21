# راهنمای انتشار `feat/new-app`

این سند فهرست نهایی migrationها و متغیرهای محیطی اضافه‌شده در این branch نسبت به `main` است. وضعیت اعمال‌شدن روی هر سرور باید با `prisma migrate status` بررسی شود؛ وجود فایل در Git به معنی اجراشدن آن روی دیتابیس نیست.

## Migrationهای دیتابیس

| ترتیب | Migration | تغییر اصلی | وابستگی/ریسک |
|---:|---|---|---|
| 1 | `20260827120000_add_reservation_idempotency` | ستون nullable و unique index برای جلوگیری از ثبت رزرو تکراری | کم‌ریسک؛ کد جدید به ستون نیاز دارد |
| 2 | `20260903120000_search_title_trigram_indexes` | فعال‌سازی `pg_trgm` و GIN indexهای سرچ ملک، شهر، لندینگ و `options_array` | کاربر DB باید اجازه ایجاد extension داشته باشد |
| 3 | `20260903150000_add_property_sort_indexes` | indexهای مرتب‌سازی پایدار ارزان‌ترین، گران‌ترین و محبوب‌ترین | index-only؛ در ساعت کم‌ترافیک اجرا شود |
| 4 | `20260903193000_add_test_access_whitelist` | enum و جدول whitelist دامنه تست | قبل از فعال‌کردن محدودیت ورود لازم است |
| 5 | `20260904120000_optimize_blog_content_queries` | indexهای دسته‌بندی، انتشار و attachment بلاگ | index-only؛ در ساعت کم‌ترافیک اجرا شود |
| 6 | `20260904150000_add_landing_location_indexes` | indexهای استان و شهرهای لندینگ | index-only؛ در ساعت کم‌ترافیک اجرا شود |
| 7 | `20260920120000_add_reserve_quote_snapshot` | snapshot تعداد شب و مبلغ تقریبی درخواست | nullable؛ migration فقط ساخته شده و باید در deploy اجرا شود |

Migrationها باید دقیقاً با همین ترتیب اجرا شوند. هیچ migration دیگری در اختلاف این branch با `main` وجود ندارد. تغییرات کیفیت و دانلود تصویر migration دیتابیس ندارند.

## متغیرهای جدید Back

```dotenv
TEST_ACCESS_ENABLED=0
TEST_TEAM_LEAD_MOBILE=09XXXXXXXXX
```

- سرور `jayab.app`: مقدار `TEST_ACCESS_ENABLED=0`؛ محدودیت whitelist اعمال نمی‌شود.
- سرور `jayab.org`: مقدار `TEST_ACCESS_ENABLED=1` و شماره واقعی تیم‌لید در `TEST_TEAM_LEAD_MOBILE`.
- اعضای QA پس از migration از تب مدیریت دسترسی تیم‌لید اضافه می‌شوند؛ شماره آن‌ها نباید به env اضافه شود.

## متغیرهای Front برای runtime

دامنه اصلی:

```dotenv
SANDBOX_MODE=0
SITE_NOINDEX=false
NOINDEX_HOSTS=jayab.org,www.jayab.org
NEXT_PUBLIC_MAIN_SITE_URL=https://jayab.app
```

دامنه تست:

```dotenv
SANDBOX_MODE=1
SITE_NOINDEX=true
NOINDEX_HOSTS=jayab.org,www.jayab.org
NEXT_PUBLIC_MAIN_SITE_URL=https://jayab.app
```

- `SANDBOX_MODE=1` فقط در Front تست باعث نمایش کد OTP برگشتی از Back می‌شود؛ روی `.app` حتماً `0` باشد.
- `SITE_NOINDEX=true` و `NOINDEX_HOSTS` مانع indexشدن دامنه تست می‌شوند.
- `NEXT_PUBLIC_MAIN_SITE_URL` مقصد انتقال مسیرهای محافظت‌شده از محیط تست به سایت اصلی است.
- متغیرهای عمومی موجود مانند `NEXT_PUBLIC_BASE_URL`، `NEXT_PUBLIC_SITE_URL`، `NEXT_PUBLIC_WEB_SITE` و `NEXT_PUBLIC_WEBSITE_URL` باید برای هر deployment به دامنه همان محیط اشاره کنند.

این متغیرها فقط برای توسعه و CI هستند و روی runtime سرور الزامی نیستند:

```dotenv
OPENAPI_SCHEMA_URL=http://127.0.0.1:3001/api-json
OPENAPI_SCHEMA_PATH=./openapi/jayab.openapi.json
MIGRATION_BASE_SHA=<git-base-sha>
```

## ترتیب امن انتشار

1. از PostgreSQL بکاپ قابل‌بازیابی بگیرید.
2. متغیرهای جدید Back و Front را در محیط درست تنظیم کنید؛ secret یا شماره واقعی را commit نکنید.
3. وجود `pg_trgm` را بررسی کنید:

   ```sql
   SELECT extname FROM pg_extension WHERE extname = 'pg_trgm';
   ```

   اگر وجود ندارد، با کاربر مجاز اجرا کنید:

   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   ```

4. در نسخه Back که پوشه `prisma/migrations` جدید را دارد اجرا کنید:

   ```bash
   npx prisma migrate status
   npx prisma migrate deploy
   npx prisma generate
   npm run build
   ```

   از `prisma migrate dev` و `prisma db push` روی production استفاده نکنید. ساخت index می‌تواند برای مدت کوتاهی قفل ایجاد کند؛ deploy را در ساعت کم‌ترافیک انجام دهید.

5. Back را restart و health/APIهای اصلی را smoke test کنید.
6. Front هر محیط را با env همان محیط build و deploy کنید. متغیرهای `NEXT_PUBLIC_*` در زمان build ثابت می‌شوند؛ تغییر env بدون rebuild کافی نیست.
7. دوباره `npx prisma migrate status` را اجرا کنید؛ نباید migration معلقی باقی مانده باشد.

## کنترل بعد از انتشار

- ورود `.app` برای کاربر عادی بدون محدودیت whitelist انجام شود.
- در `.org` شماره خارج whitelist قبل از ارسال OTP رد شود، عضو QA وارد شود و فقط تیم‌لید تب مدیریت را ببیند.
- فیلترهای ارزان‌ترین، گران‌ترین و محبوب‌ترین نتیجه تکراری تولید نکنند.
- سرچ شهر/ملک و لندینگ شهرهای مختلف پاسخ صحیح بدهند.
- لیست و جزئیات بلاگ خطای 500 یا timeout ندهند.
- retry ثبت رزرو باعث رزرو تکراری نشود.
- نمایش و دانلود تصویر ملک و نمایش تصویر بلاگ بررسی شود؛ دانلود ملک باید WebP معتبر باشد.

برای اطمینان از ساخته‌شدن indexها:

```sql
SELECT indexname
FROM pg_indexes
WHERE indexname IN (
  'properties_title_trgm_idx',
  'cities_title_trgm_idx',
  'landing_pages_title_trgm_idx',
  'properties_options_array_gin_idx',
  'properties_sort_order_id_idx',
  'properties_advisor_commission_id_idx',
  'properties_favorite_count_id_idx',
  'content_categories_parent_id_idx',
  'contents_category_active_published_idx',
  'contents_category_order_created_idx',
  'content_attachments_content_id_idx',
  'landing_pages_active_province_idx',
  'landing_pages_cities_gin_idx'
)
ORDER BY indexname;
```

## فاز ۰۸ صفحهٔ آگهی — هماهنگی مستقیم با میزبان (بدون مایگریشن)

- مایگریشن ندارد.
- بک و فرانت باید هم‌زمان دیپلوی شوند: فرانت جدید `POST /v2/reserves` را صدا می‌زند (پاسخ `{ reserve, created }`). نسخهٔ ۱ همان رفتار قبلی را دارد و برای کلاینت‌های قدیمی می‌ماند.
- اعتبارسنجی جدید ثبت درخواست (روی هر دو نسخه): `RESERVE_DATES_UNAVAILABLE` (۴۲۲)، `RESERVE_MAX_NIGHTS` (۴۲۲، بیش از ۱۵ شب)، `RESERVE_OWN_PROPERTY` (۴۰۳).
- `contact-info` حالا `isPropertyExpired` برمی‌گرداند؛ کش ردیس `contact:{code}` تاریخ انقضا را نگه می‌دارد و مقدار در هر خواندن محاسبه می‌شود. ورودی‌های قدیمی کش (بدون تاریخ) نادیده گرفته می‌شوند.
- عنوان وضعیت برای مهمان: «ارسال‌شده برای میزبان» و «میزبان تماس گرفت»؛ فهرست مشترک وضعیت‌ها (پنل مالک/ادمین) تغییری نکرده است.
- تست بعد از دیپلوی: ثبت درخواست روی آگهی فعال و منقضی، ثبت روی شب رزروشده (۴۲۲)، ثبت مالک روی آگهی خودش (۴۰۳)، دو کلیک سریع (یک ردیف).

## فاز ۰۹ صفحهٔ آگهی — نکات دیپلوی

- migration شمارهٔ ۷ ستون‌های `nights` و `quoted_total` را اضافه می‌کند؛ `prisma generate` (بخشی از `yarn build`) باید بعد از آن انجام شود.
- قالب پیامک «درخواست رزرو» در sms.ir باید هم‌زمان با دیپلوی متن جدید `sms-templates.txt` را (شامل `#AMOUNT#`) داشته باشد. پارامتر `AMOUNT` همیشه ارسال می‌شود؛ درخواست‌های قدیمی بدون snapshot مقدار `-` می‌گیرند.
- `GET /user/properties/:propertyId/similar` ده دقیقه کش می‌شود و `seo_links` در جزئیات آگهی یک ساعت در Redis (`seo-links:{city}:{province}:{has_pool}`) کش می‌شود.
- مبلغ snapshot با همان محاسبهٔ `GET .../quote` ساخته می‌شود (یک منبع محاسبه).

## فاز ۱۱ صفحهٔ آگهی — نقشهٔ موقعیت (بدون مایگریشن)

مایگریشن ندارد. قبل از دیپلوی این متغیرها باید روی سرورها تنظیم شوند:

Back:

```dotenv
LOCATION_OBFUSCATION_SALT=<رشتهٔ تصادفی حداقل ۱۶ کاراکتر، ترجیحاً ۳۲>
```

- در `NODE_ENV=production` این متغیر الزامی است و بدون آن Back بالا نمی‌آید.
- برای آگهی‌هایی که `is_location_visible = false` هستند، پاسخ تک‌آگهی حالا `approx_location` دارد: مرکز جابه‌جاشدهٔ قطعی (۲۰۰ تا ۵۰۰ متر، گرد شده به ۳ رقم اعشار) و `radius_m = 700`. مختصات واقعی و آدرس همچنان `null` هستند.
- مرکز دایره با salt و شناسهٔ آگهی ساخته می‌شود؛ **salt را بعد از انتشار عوض نکنید** وگرنه دایرهٔ همهٔ آگهی‌ها جابه‌جا می‌شود. بدون salt (یا کوتاه‌تر از ۱۶ کاراکتر) `approx_location` همیشه `null` است و Front برای آن آگهی نقشه نشان نمی‌دهد.
- برای مالک آگهی و آگهی‌های با موقعیت نمایان، `approx_location = null`.

Front (`.env` هر deployment؛ نمونه در `.env.example`):

```dotenv
NEXT_PUBLIC_NESHAN_MAP_KEY=<کلید web نشان>
NESHAN_SERVICE_KEY=<کلید service نشان>
```

- `NEXT_PUBLIC_NESHAN_MAP_KEY` هنگام **build** داخل bundle قرار می‌گیرد؛ قبل از `yarn build` تنظیم شود. کلید web فقط برای بارگذاری تایل است و ذاتاً عمومی است.
- `NESHAN_SERVICE_KEY` فقط روی سرور Next.js (runtime) لازم است و هرگز `NEXT_PUBLIC_` نشود. جست‌وجوی آدرس و reverse geocode حالا از `/api/map/search` و `/api/map/reverse` می‌گذرند؛ مرورگر دیگر مستقیم با `api.neshan.org` حرف نمی‌زند.
- هر دو کلید قبلاً در کد (و تاریخچهٔ git) و bundle مرورگرها بوده‌اند. **بعد از دیپلوی و تأیید کارکرد، هر دو کلید را در پنل نشان rotate کنید** و مقدار جدید را در env قرار دهید (کلید web با build مجدد). تا آن زمان کلید service قدیمی قابل سوءاستفاده است.
- اگر پنل نشان محدودسازی کلید web به دامنه دارد، آن را به `jayab.app`، `jayab.org` و `localhost:3037` محدود کنید.
- پکیج نقشه عوض شده (`@neshan-maps-platform/maplibre-sdk@5.24.4` به‌جای `mapbox-gl`)؛ روی سرور `yarn install` لازم است.
- سهمیه: پرواز از زوم ۲ تا ۱۵ تایل چند سطح را می‌گیرد. مصرف یک بازدید کامل را در پنل نشان اندازه بگیرید. نقشه فقط وقتی کاربر نزدیک بخش موقعیت شود بارگذاری می‌شود.
- مرورگرهای بدون `DecompressionStream`/WebGL2 (Safari قدیمی‌تر از ۱۶٫۴) نقشه نمی‌بینند: صفحهٔ آگهی و تماس کارت جایگزین دارند و wizard میزبان فقط با جست‌وجوی آدرس موقعیت می‌گیرد.
- تست بعد از دیپلوی: آگهی با موقعیت نمایان (پین + پرواز)، آگهی با موقعیت پنهان (دایرهٔ تقریبی و بدون آدرس/مختصات در پاسخ)، جست‌وجوی آدرس در wizard، نقشهٔ صفحهٔ تماس با ما، و در DevTools اطمینان از نبود درخواست به `api.neshan.org/v1/search` و `/v5/reverse`.
