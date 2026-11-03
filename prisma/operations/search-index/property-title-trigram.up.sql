-- Run manually with autocommit enabled after the benchmark and DBA approval.
-- CREATE INDEX CONCURRENTLY cannot run inside a Prisma migration transaction.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS properties_title_trgm_idx
ON public.properties USING GIN (title gin_trgm_ops)
WHERE deleted_at IS NULL;

ANALYZE public.properties;
