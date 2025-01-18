/*
  Warnings:

  - The `options` column on the `landing_pages` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "landing_pages" DROP COLUMN "options",
ADD COLUMN     "options" INTEGER[];
