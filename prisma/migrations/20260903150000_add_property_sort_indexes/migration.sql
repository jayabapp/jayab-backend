-- These indexes are created concurrently because property discovery remains live
-- while production migrations run. Each compound key matches the deterministic
-- ordering used by the offset-paginated discovery endpoint.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "properties_sort_order_id_idx"
ON "properties"("sort_order", "id");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "properties_advisor_commission_id_idx"
ON "properties"("advisor_commission", "id");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "properties_favorite_count_id_idx"
ON "properties"("favorite_count", "id");

-- The compound indexes retain the original leading columns, so they also
-- serve queries that only order/filter by sort_order or advisor_commission.
DROP INDEX CONCURRENTLY IF EXISTS "properties_sort_order_idx";
DROP INDEX CONCURRENTLY IF EXISTS "properties_advisor_commission_idx";
