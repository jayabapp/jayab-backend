-- DropForeignKey
ALTER TABLE "public"."banners" DROP CONSTRAINT "banners_image_id_fkey";

-- DropIndex
DROP INDEX "public"."properties_options_array_idx";

-- AlterTable
ALTER TABLE "public"."banners" ALTER COLUMN "image_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."banners" ADD CONSTRAINT "banners_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "public"."attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
