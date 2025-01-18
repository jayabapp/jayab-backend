/*
  Warnings:

  - You are about to drop the column `city_id` on the `landing_pages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "landing_pages" DROP COLUMN "city_id",
ADD COLUMN     "cities" INTEGER[],
ADD COLUMN     "image_id" INTEGER;

-- AddForeignKey
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
