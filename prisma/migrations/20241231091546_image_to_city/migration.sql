-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "image_id" INTEGER,
ADD COLUMN     "slug_fa" TEXT;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
