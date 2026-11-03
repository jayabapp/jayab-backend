# مایگریشن‌های معلق — برنچ `feat/new-app`

> وضعیت: **هیچ‌کدام روی سرور اعمال نشده.** عمداً نگه داشته شده‌اند تا یک‌جا اجرا شوند.
> آخرین به‌روزرسانی: ۱۴۰۵/۰۶/۱۲ (2026-09-03) — هر دو مایگریشن مرور شدند.

هر بار که مایگریشن تازه‌ای به این برنچ اضافه شد، همین‌جا ثبتش کنید.

---

## خلاصه‌ی اجرایی

دو مایگریشن معلق است. **هر دو کم‌ریسک‌اند و کل اجرا چند ثانیه طول می‌کشد.**

| مایگریشن | چه می‌کند | ریسک |
|---|---|---|
| `20260827120000_add_reservation_idempotency` | یک ستون nullable + یک ایندکس یکتا روی `property_reserves` | پایین |
| `20260903120000_search_title_trigram_indexes` | چهار ایندکس روی `properties` / `cities` / `landing_pages` | پایین |

دستور اجرا، بعد از دیپلوی کد این برنچ:

```bash
npx prisma migrate deploy
```

`migrate deploy` فقط مایگریشن‌های اعمال‌نشده را به ترتیب تاریخ اجرا می‌کند و هرگز
دیتابیس را ری‌ست نمی‌کند — همان چیزی که برای پروداکشن می‌خواهیم.
**`migrate dev` را هرگز روی سرور اجرا نکنید** (دیتابیس را drop می‌کند).

---

## چرا این‌بار نگران قفل‌شدن جدول نیستیم

نسخه‌ی قبلی همین سند توصیه می‌کرد «حتماً در ساعت کم‌ترافیک اجرا شود، چون ساخت
ایندکس قفل نوشتن می‌گیرد». آن هشدار بیش از حد محتاطانه بود و اینجا اصلاح می‌شود.

موقع بررسی سرچ، تعداد کل ملک‌ها از خود API اندازه‌گیری شد:

```
GET /api/v1/user/properties?max_price=999999999&page=1&per_page=1  →  meta.total = 3324
```

**۳٬۳۲۴ ردیف.** ساخت ایندکس GIN روی جدولی به این اندازه کسری از ثانیه است، نه
دقیقه. `cities` و `landing_pages` هم کوچک‌ترند. یعنی پنجره‌ی قفل نوشتن عملاً
نامحسوس است و نیازی به نسخه‌ی `CREATE INDEX CONCURRENTLY` نیست — آن گزینه
پیچیدگی می‌آورد (نمی‌تواند داخل تراکنش Prisma اجرا شود و باید دستی بیرون از
`migrate deploy` زده شود) بدون اینکه در این مقیاس چیزی بخرد.

با این حال ساعت کم‌ترافیک را انتخاب کنید — نه به‌خاطر ایندکس‌ها، بلکه چون
دیپلوی کد همراهش انجام می‌شود.

---

## فهرست

### ۱. `20260827120000_add_reservation_idempotency`

- **وضعیت:** کامیت‌شده روی برنچ (کامیت `2ec175c`) — کار قبلی روی این برنچ، من نساختمش
- **مرور شد:** بله (۱۴۰۵/۰۶/۱۲)

```sql
ALTER TABLE "property_reserves"
ADD COLUMN "idempotency_key" VARCHAR(100);

CREATE UNIQUE INDEX "property_reserves_user_id_idempotency_key_key"
ON "property_reserves"("user_id", "idempotency_key");
```

نتیجه‌ی مرور:

- ستون **nullable و بدون `DEFAULT`** است. در PostgreSQL 11 به بعد این یک تغییر
  متادیتایی محض است — جدول بازنویسی نمی‌شود و هیچ ردیفی لمس نمی‌شود. آنی است.
- ایندکس یکتا روی داده‌ی موجود **شکست نمی‌خورد**: تمام ردیف‌های فعلی
  `idempotency_key = NULL` می‌گیرند و در ایندکس یکتای PostgreSQL چند NULL با هم
  تداخل ندارند (NULLها distinct در نظر گرفته می‌شوند). پس خطر «duplicate key»
  در زمان ساخت وجود ندارد.
- تا وقتی کد جدید مقدار `idempotency_key` را ننویسد، رفتار سیستم عوض نمی‌شود.
  پس ترتیب امن است: کد و مایگریشن با هم دیپلوی شوند.

### ۲. `20260903120000_search_title_trigram_indexes`

- **وضعیت:** کامیت‌شده روی برنچ (کامیت `8000255`)
- **نوع:** فقط ایندکس — هیچ جدولی بازنویسی نمی‌شود و هیچ سطری تغییر نمی‌کند

| ایندکس | جدول | چرا |
|---|---|---|
| `properties_title_trgm_idx` | properties | `title ILIKE '%…%'` بدون ایندکس trigram، sequential scan است |
| `cities_title_trgm_idx` | cities | هر کلیدفشار پنل سرچ، هر کلمه را با ILIKE روی این ستون می‌زند |
| `landing_pages_title_trgm_idx` | landing_pages | همان مسیر پیشنهادها |
| `properties_options_array_gin_idx` | properties | **بازگرداندن ایندکس حذف‌شده** — توضیح پایین |

اندازه‌گیری قبل از این مایگریشن، روی API پروداکشن:

```
q=ویلا تبریز   →  5292ms
q=تبریز        → 16524ms
q=ویلا         →  4840ms
بدون هیچ فیلتر  →  504 Gateway Timeout بعد از 15124ms
```

---

## نکته‌ی مهم: ایندکس `options_array` روی سرور وجود ندارد

این یک باگ خفته است که موقع بررسی سرچ پیدا شد و ربطی به تغییرات من ندارد:

1. `20260408092148_property_indexes` ایندکس را با نام `properties_options_array_idx` ساخت.
2. `20260512151644_optional_imageid_in_banner` آن را **`DROP` کرد** — به‌عنوان عارضه‌ی
   جانبی یک تغییر ستون در جدول بنر. آن موقع `schema.prisma` این ایندکس را اعلام نکرده
   بود، پس Prisma خودش دستور حذف را تولید کرد.
3. بعداً `schema.prisma` این خط را گرفت:
   `@@index([options_array], map: "properties_options_array_gin_idx", type: Gin)`
   ولی با **نام متفاوت**، و هیچ مایگریشنی آن نام را نساخت.

**نتیجه:** الان روی سرور هیچ ایندکسی روی `options_array` نیست، در حالی که schema
ادعا می‌کند هست. هر فیلتر `property_type` / `ownership` / `welfare` / `kitchen` /
`entertainment` / `pool_type` / `pet` یک sequential scan کامل است — و `/extract`
تقریباً روی هر جستجوی متنی `property_type` تولید می‌کند، پس این روی مسیر داغ است.

مایگریشن شماره ۲ آن را با همان نامی که schema اعلام کرده می‌سازد، پس drift هم بسته می‌شود.

---

## قبل از اجرا

- [ ] بکاپ دیتابیس گرفته شده
- [ ] `npx prisma migrate status` اجرا شده تا فهرست اعمال‌نشده‌ها تأیید شود
      (باید دقیقاً همین دو مورد باشند؛ اگر بیشتر بود، قبل از ادامه بررسی کنید)
- [ ] **دسترسی ساخت اکستنشن چک شده** — تنها پیش‌نیازی که می‌تواند مایگریشن ۲ را
      شکست بدهد این خط است:

      ```sql
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      ```

      اگر کاربر دیتابیس superuser نباشد و `pg_trgm` از قبل نصب نباشد، این دستور
      permission denied می‌دهد و کل مایگریشن rollback می‌شود. برای چک‌کردن:

      ```sql
      SELECT * FROM pg_extension WHERE extname = 'pg_trgm';
      ```

      اگر خروجی خالی بود، یک‌بار با کاربر superuser اجرایش کنید و بعد
      `migrate deploy` را بزنید.

---

## بعد از اجرا — تأیید کنید که واقعاً کار کرده

۱. پلن کوئری باید از `Seq Scan` به `Bitmap Index Scan` رفته باشد:

```sql
EXPLAIN ANALYZE
SELECT id FROM properties WHERE title ILIKE '%تبریز%';
```

۲. هر چهار ایندکس ساخته شده باشند:

```sql
SELECT indexname FROM pg_indexes
WHERE indexname IN (
  'properties_title_trgm_idx',
  'cities_title_trgm_idx',
  'landing_pages_title_trgm_idx',
  'properties_options_array_gin_idx'
);
```

باید چهار ردیف برگردد.

۳. زمان‌های واقعی را دوباره اندازه بگیرید و با جدول بالا مقایسه کنید:

```
q=ویلا تبریز · q=تبریز · q=ویلا · بدون فیلتر
```

اگر `q=تبریز` هنوز چند ثانیه است، مشکل جای دیگری است و باید `EXPLAIN ANALYZE`
کامل کوئری لیست گرفته شود.

۴. `npx prisma migrate status` دوباره — باید بگوید هیچ مایگریشن اعمال‌نشده‌ای نمانده.

---

## اگر لازم شد برگردید

ایندکس‌ها را می‌شود بدون از دست رفتن داده حذف کرد:

```sql
DROP INDEX IF EXISTS "properties_title_trgm_idx";
DROP INDEX IF EXISTS "cities_title_trgm_idx";
DROP INDEX IF EXISTS "landing_pages_title_trgm_idx";
DROP INDEX IF EXISTS "properties_options_array_gin_idx";
```

مایگریشن ۱ هم برگشت‌پذیر است، ولی **فقط تا وقتی کدی که `idempotency_key` را
می‌نویسد هنوز فعال نشده باشد**:

```sql
DROP INDEX IF EXISTS "property_reserves_user_id_idempotency_key_key";
ALTER TABLE "property_reserves" DROP COLUMN IF EXISTS "idempotency_key";
```

توجه: اگر جدول `_prisma_migrations` را دستی دست‌کاری کردید، ردیف مایگریشن مربوطه
را هم پاک کنید وگرنه Prisma فکر می‌کند اعمال شده.

---

## یک باگ بک‌اند که مایگریشن حلش نمی‌کند

موقع تست فیلترها پیدا شد و **ربطی به این مایگریشن‌ها ندارد** — اینجا ثبت می‌شود
که گم نشود:

**`min_price` بدون `max_price` روی API پروداکشن قطعی ۵۰۰ می‌دهد.**

```
500  min_price=1                       500  min_price=999999999
500  max_price=0                       200  max_price=999999999   → 3324
200  min_price=1&max_price=999999999   → 3324
```

۵ بار از ۵ بار، برای هر مقداری. همان مجموعه‌ی نتایج با هر دو کران کار می‌کند و با
یکی نمی‌کند. `min_building_area` و `min_commission` یک‌طرفه سالم‌اند؛ فقط قیمت.

سمت فرانت موقتاً بسته شد (اسلایدر حالا همیشه هر دو کران را می‌فرستد)، ولی
**خود باگ بک‌اند هنوز باز است**. کد این برنچ در
`src/property/common/effective-price.helper.ts` درست به نظر می‌رسد، که احتمالش را
بالا می‌برد که سرور نسخه‌ی قدیمی‌تری اجرا می‌کند. بعد از این دیپلوی دوباره تستش
کنید — ممکن است خودبه‌خود حل شده باشد.
# هشدار: این فایل آرشیوی و ناقص است

فهرست نهایی ۶ migration، envها و ترتیب انتشار در
[`NEW-APP-DEPLOYMENT.md`](./NEW-APP-DEPLOYMENT.md) نگهداری می‌شود. برای deploy فقط سند جدید را مبنا قرار دهید.
