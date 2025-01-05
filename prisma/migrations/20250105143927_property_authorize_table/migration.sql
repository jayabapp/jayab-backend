/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `properties` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "properties" ALTER COLUMN "advisor_commission" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "property_authorized" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "nc_image_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_authorized_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PropertyAuthDocsImage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "property_authorized_property_id_key" ON "property_authorized"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "_PropertyAuthDocsImage_AB_unique" ON "_PropertyAuthDocsImage"("A", "B");

-- CreateIndex
CREATE INDEX "_PropertyAuthDocsImage_B_index" ON "_PropertyAuthDocsImage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "properties_code_key" ON "properties"("code");

-- AddForeignKey
ALTER TABLE "property_authorized" ADD CONSTRAINT "property_authorized_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_authorized" ADD CONSTRAINT "property_authorized_nc_image_id_fkey" FOREIGN KEY ("nc_image_id") REFERENCES "attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyAuthDocsImage" ADD CONSTRAINT "_PropertyAuthDocsImage_A_fkey" FOREIGN KEY ("A") REFERENCES "attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyAuthDocsImage" ADD CONSTRAINT "_PropertyAuthDocsImage_B_fkey" FOREIGN KEY ("B") REFERENCES "property_authorized"("id") ON DELETE CASCADE ON UPDATE CASCADE;
