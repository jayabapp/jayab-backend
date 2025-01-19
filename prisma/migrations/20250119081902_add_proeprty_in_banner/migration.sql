/*
  Warnings:

  - You are about to drop the column `product_id` on the `banners` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "banners" DROP COLUMN "product_id",
ADD COLUMN     "property_id" INTEGER;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
