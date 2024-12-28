/*
  Warnings:

  - A unique constraint covering the columns `[owner_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "owner_id" INTEGER;

-- CreateTable
CREATE TABLE "owners" (
    "id" SERIAL NOT NULL,
    "national_code" VARCHAR(10) NOT NULL,
    "selfie_image_id" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "owners_national_code_key" ON "owners"("national_code");

-- CreateIndex
CREATE UNIQUE INDEX "owners_selfie_image_id_key" ON "owners"("selfie_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_owner_id_key" ON "users"("owner_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owners" ADD CONSTRAINT "owners_selfie_image_id_fkey" FOREIGN KEY ("selfie_image_id") REFERENCES "attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
