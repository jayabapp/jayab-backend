/*
  Warnings:

  - A unique constraint covering the columns `[advisor_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "advisor_id" INTEGER;

-- CreateTable
CREATE TABLE "advisors" (
    "id" SERIAL NOT NULL,
    "national_code" VARCHAR(10) NOT NULL,
    "tel" VARCHAR(11),
    "area_code" VARCHAR(3),
    "address" TEXT NOT NULL,
    "is_special" BOOLEAN NOT NULL DEFAULT false,
    "status" SMALLINT NOT NULL,
    "sort_order" INTEGER,
    "profile_image_id" INTEGER NOT NULL,
    "national_card_image_id" INTEGER NOT NULL,
    "document_image_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advisors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AdvisorToCity" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "advisors_national_code_key" ON "advisors"("national_code");

-- CreateIndex
CREATE UNIQUE INDEX "advisors_profile_image_id_key" ON "advisors"("profile_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "advisors_national_card_image_id_key" ON "advisors"("national_card_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "advisors_document_image_id_key" ON "advisors"("document_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "_AdvisorToCity_AB_unique" ON "_AdvisorToCity"("A", "B");

-- CreateIndex
CREATE INDEX "_AdvisorToCity_B_index" ON "_AdvisorToCity"("B");

-- CreateIndex
CREATE UNIQUE INDEX "users_advisor_id_key" ON "users"("advisor_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_advisor_id_fkey" FOREIGN KEY ("advisor_id") REFERENCES "advisors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advisors" ADD CONSTRAINT "advisors_profile_image_id_fkey" FOREIGN KEY ("profile_image_id") REFERENCES "attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advisors" ADD CONSTRAINT "advisors_national_card_image_id_fkey" FOREIGN KEY ("national_card_image_id") REFERENCES "attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advisors" ADD CONSTRAINT "advisors_document_image_id_fkey" FOREIGN KEY ("document_image_id") REFERENCES "attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdvisorToCity" ADD CONSTRAINT "_AdvisorToCity_A_fkey" FOREIGN KEY ("A") REFERENCES "advisors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdvisorToCity" ADD CONSTRAINT "_AdvisorToCity_B_fkey" FOREIGN KEY ("B") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
