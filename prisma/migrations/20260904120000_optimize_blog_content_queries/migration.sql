-- These indexes are built concurrently because the CMS remains online while
-- production migrations are applied.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "content_categories_parent_id_idx"
ON "content_categories"("parent_id");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "contents_category_active_published_idx"
ON "contents"("category_id", "is_active", "published_at");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "contents_category_order_created_idx"
ON "contents"("category_id", "is_active", "order", "created_at" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "content_attachments_content_id_idx"
ON "content_attachments"("content_id");
