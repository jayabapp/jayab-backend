-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "feature_image_id" INTEGER,
ADD COLUMN     "video_id" INTEGER;

-- CreateTable
CREATE TABLE "_Property" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Property_Temp" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Property_AB_unique" ON "_Property"("A", "B");

-- CreateIndex
CREATE INDEX "_Property_B_index" ON "_Property"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Property_Temp_AB_unique" ON "_Property_Temp"("A", "B");

-- CreateIndex
CREATE INDEX "_Property_Temp_B_index" ON "_Property_Temp"("B");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_feature_image_id_fkey" FOREIGN KEY ("feature_image_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Property" ADD CONSTRAINT "_Property_A_fkey" FOREIGN KEY ("A") REFERENCES "attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Property" ADD CONSTRAINT "_Property_B_fkey" FOREIGN KEY ("B") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Property_Temp" ADD CONSTRAINT "_Property_Temp_A_fkey" FOREIGN KEY ("A") REFERENCES "attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Property_Temp" ADD CONSTRAINT "_Property_Temp_B_fkey" FOREIGN KEY ("B") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
