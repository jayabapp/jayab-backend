-- CreateIndex
CREATE INDEX "landing_pages_url_idx" ON "landing_pages"("url");

-- AddForeignKey
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_main_content_id_fkey" FOREIGN KEY ("main_content_id") REFERENCES "contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
