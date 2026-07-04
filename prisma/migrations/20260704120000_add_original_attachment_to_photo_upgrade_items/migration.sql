ALTER TABLE "property_photo_upgrade_request_items"
ADD COLUMN "original_attachment_id" INTEGER;

CREATE INDEX "property_photo_upgrade_request_items_original_attachment_id_idx"
ON "property_photo_upgrade_request_items"("original_attachment_id");

ALTER TABLE "property_photo_upgrade_request_items"
ADD CONSTRAINT "property_photo_upgrade_request_items_original_attachment_id_fkey"
FOREIGN KEY ("original_attachment_id") REFERENCES "attachments"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
