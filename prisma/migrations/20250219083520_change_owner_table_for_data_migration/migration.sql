-- DropForeignKey
ALTER TABLE "owners" DROP CONSTRAINT "owners_selfie_image_id_fkey";

-- DropIndex
DROP INDEX "owners_national_code_key";

-- AlterTable
ALTER TABLE "owners" ALTER COLUMN "selfie_image_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "owners" ADD CONSTRAINT "owners_selfie_image_id_fkey" FOREIGN KEY ("selfie_image_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
