CREATE INDEX CONCURRENTLY IF NOT EXISTS "landing_pages_active_province_idx"
ON "landing_pages"("is_active", "province_id");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "landing_pages_cities_gin_idx"
ON "landing_pages" USING GIN ("cities");
