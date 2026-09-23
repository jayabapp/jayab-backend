-- CreateTable
CREATE TABLE "banner_attachments" (
    "id" SERIAL NOT NULL,
    "banner_id" INTEGER NOT NULL,
    "attachment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "banner_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "banner_attachments_banner_id_idx" ON "banner_attachments"("banner_id");

-- AddForeignKey
ALTER TABLE "banner_attachments" ADD CONSTRAINT "banner_attachments_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banner_attachments" ADD CONSTRAINT "banner_attachments_banner_id_fkey" FOREIGN KEY ("banner_id") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: consolidate existing "اسلایدر هیرو" (position = 'main_1') banner
-- rows into a single canonical record now that one banner can hold many slide
-- images via banner_attachments. Before this, every extra hero slide was a
-- separate banner row; the panel's edit form only ever showed that row's own
-- image, which is what prompted this migration.
--
-- Safe to run on an empty banners table or with zero/one main_1 rows: the
-- sibling loop below then has nothing to iterate and is a no-op.
DO $$
DECLARE
  canonical_id INTEGER;
  sib RECORD;
  any_active BOOLEAN;
BEGIN
  -- canonical = lowest sort_order (nulls last), then lowest id, among rows
  -- that actually have a primary image (so we don't pick an empty row).
  SELECT id INTO canonical_id
  FROM banners
  WHERE position = 'main_1' AND image_id IS NOT NULL
  ORDER BY sort_order ASC NULLS LAST, id ASC
  LIMIT 1;

  IF canonical_id IS NOT NULL THEN
    SELECT bool_or(is_active) INTO any_active
    FROM banners
    WHERE position = 'main_1';

    FOR sib IN
      SELECT id, image_id
      FROM banners
      WHERE position = 'main_1' AND id <> canonical_id
      ORDER BY sort_order ASC NULLS LAST, id ASC
    LOOP
      IF sib.image_id IS NOT NULL THEN
        INSERT INTO banner_attachments (banner_id, attachment_id, created_at, updated_at)
        VALUES (canonical_id, sib.image_id, now(), now());
      END IF;

      -- the sibling row is now redundant (its image lives in
      -- banner_attachments); deactivate instead of deleting so no data or
      -- history is lost and it can be reviewed/restored manually if needed.
      UPDATE banners SET is_active = false WHERE id = sib.id;
    END LOOP;

    -- keep the merged hero visible if any of the original rows was active
    IF any_active THEN
      UPDATE banners SET is_active = true WHERE id = canonical_id;
    END IF;
  END IF;
END $$;
