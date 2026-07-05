-- CreateIndex
CREATE INDEX "owners_national_code_idx" ON "public"."owners"("national_code");

-- CreateIndex
CREATE INDEX "property_reports_property_id_idx" ON "public"."property_reports"("property_id");

-- CreateIndex
CREATE INDEX "property_reports_user_id_idx" ON "public"."property_reports"("user_id");

-- RenameForeignKey
ALTER TABLE "public"."property_photo_upgrade_request_items" RENAME CONSTRAINT "property_photo_upgrade_request_items_original_attachment_id_fke" TO "property_photo_upgrade_request_items_original_attachment_i_fkey";

-- RenameIndex
ALTER INDEX "public"."property_photo_upgrade_request_items_request_id_attachment_id_k" RENAME TO "property_photo_upgrade_request_items_request_id_attachment__key";
