-- Prisma applies this migration transactionally; CONCURRENTLY is not valid
-- inside that transaction.
CREATE INDEX IF NOT EXISTS "landing_pages_active_province_idx"
ON "landing_pages"("is_active", "province_id");

CREATE INDEX IF NOT EXISTS "landing_pages_cities_gin_idx"
ON "landing_pages" USING GIN ("cities");
