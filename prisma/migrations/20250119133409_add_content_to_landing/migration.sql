/*
  Warnings:

  - You are about to drop the column `content_category_id` on the `landing_pages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "landing_pages" DROP COLUMN "content_category_id",
ADD COLUMN     "main_content_id" INTEGER,
ADD COLUMN     "related_contents" INTEGER[];
