CREATE TABLE "property_images" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "attachment_id" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "property_images_property_id_attachment_id_key"
ON "property_images"("property_id", "attachment_id");

CREATE INDEX "property_images_property_id_sort_order_idx"
ON "property_images"("property_id", "sort_order");

CREATE INDEX "property_images_attachment_id_idx"
ON "property_images"("attachment_id");

ALTER TABLE "property_images"
ADD CONSTRAINT "property_images_property_id_fkey"
FOREIGN KEY ("property_id") REFERENCES "properties"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "property_images"
ADD CONSTRAINT "property_images_attachment_id_fkey"
FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

DO $$
BEGIN
  IF to_regclass('public."_Property"') IS NOT NULL THEN
    INSERT INTO "property_images" ("property_id", "attachment_id", "sort_order", "created_at", "updated_at")
    SELECT
      "_Property"."B",
      "_Property"."A",
      ROW_NUMBER() OVER (PARTITION BY "_Property"."B" ORDER BY "_Property"."ctid") - 1,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    FROM "_Property"
    ON CONFLICT ("property_id", "attachment_id") DO NOTHING;

    DROP TABLE "_Property";
  END IF;
END $$;
