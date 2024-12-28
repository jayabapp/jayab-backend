/*
  Warnings:

  - You are about to drop the column `avatar_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profile_image_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referral_code]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_avatar_id_fkey";

-- DropIndex
DROP INDEX "users_avatar_id_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar_id",
ADD COLUMN     "profile_image_id" INTEGER,
ADD COLUMN     "referral_code" VARCHAR,
ADD COLUMN     "referrer_code" VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_image_id_key" ON "users"("profile_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profile_image_id_fkey" FOREIGN KEY ("profile_image_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referrer_code_fkey" FOREIGN KEY ("referrer_code") REFERENCES "users"("referral_code") ON DELETE SET NULL ON UPDATE CASCADE;
