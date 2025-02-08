-- AlterTable
ALTER TABLE "property_options" ADD COLUMN     "image_id" INTEGER;

-- AddForeignKey
ALTER TABLE "property_options" ADD CONSTRAINT "property_options_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
