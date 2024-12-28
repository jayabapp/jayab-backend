/*
  Warnings:

  - You are about to drop the `_AdvisorToCity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AdvisorToCity" DROP CONSTRAINT "_AdvisorToCity_A_fkey";

-- DropForeignKey
ALTER TABLE "_AdvisorToCity" DROP CONSTRAINT "_AdvisorToCity_B_fkey";

-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "advisorId" INTEGER,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "sort_order" INTEGER,
ADD COLUMN     "tel_prefix" TEXT;

-- DropTable
DROP TABLE "_AdvisorToCity";

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "advisors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
