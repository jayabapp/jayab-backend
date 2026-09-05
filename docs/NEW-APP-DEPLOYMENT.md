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
