-- psql example: \set term 'ویلا'
EXPLAIN (ANALYZE, BUFFERS, SETTINGS)
SELECT id, title, slug
FROM public.properties
WHERE deleted_at IS NULL
  AND status = 30
  AND title ILIKE '%' || :'term' || '%'
ORDER BY title ASC, id ASC
LIMIT 5;

SELECT
  pg_size_pretty(pg_relation_size('public.properties')) AS table_size,
  pg_size_pretty(pg_relation_size('public.properties_title_trgm_idx')) AS index_size;
