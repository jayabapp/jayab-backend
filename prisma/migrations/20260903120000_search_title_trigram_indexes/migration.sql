-- ایندکس‌های لازم برای مسیر جستجو. هیچ‌کدام داده را تغییر نمی‌دهند؛ فقط ایندکس می‌سازند.
--
-- Index-only migration: no table is rewritten and no row is touched.

-- 1) جستجوی متنی ملک روی `title ILIKE '%…%'` اجرا می‌شود و هیچ ایندکس btree نمی‌تواند
--    به آن کمک کند، چون الگو از ابتدای رشته لنگر ندارد.
--
-- Every free-text search was therefore a sequential scan of `properties`.
-- Measured against production before this migration:
--   q=ویلا تبریز ->  5.3s     q=تبریز -> 16.5s     q=ویلا -> 4.8s
--   no filters at all -> 504 Gateway Timeout after 15.1s
--
-- A trigram GIN index is the standard PostgreSQL answer for un-anchored ILIKE.
-- `cities.title` gets the same treatment because buildCitySuggestionQuery runs
-- `c.title ILIKE '%…%'` once per word on every keystroke of the search panel.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "properties_title_trgm_idx"
ON "properties" USING GIN ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "cities_title_trgm_idx"
ON "cities" USING GIN ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "landing_pages_title_trgm_idx"
ON "landing_pages" USING GIN ("title" gin_trgm_ops);

-- 2) بازگرداندن ایندکس GIN روی options_array که ناخواسته حذف شده بود.
--
-- `20260408092148_property_indexes` created it as `properties_options_array_idx`.
-- `20260512151644_optional_imageid_in_banner` then DROPped it — a side effect of a
-- banner column change, because at that point schema.prisma did not declare the
-- index and Prisma generated the drop to match. schema.prisma later gained
--   @@index([options_array], map: "properties_options_array_gin_idx", type: Gin)
-- but under a *different* name, so no migration ever recreated it.
--
-- Net effect on the server today: there is no index on options_array at all,
-- and every property_type / ownership / welfare / kitchen / entertainment /
-- pool_type / pet filter is a sequential scan. /extract emits `property_type`
-- on essentially every text search, so this is on the hot path.
--
-- The name here matches what schema.prisma declares, so Prisma stops seeing drift.
CREATE INDEX IF NOT EXISTS "properties_options_array_gin_idx"
ON "properties" USING GIN ("options_array");
