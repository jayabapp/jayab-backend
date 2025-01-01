/*
  Warnings:

  - You are about to drop the column `promoted_at` on the `properties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "properties" DROP COLUMN "promoted_at",
ADD COLUMN     "sort_order" BIGINT NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "properties_sort_order_idx" ON "properties"("sort_order");
