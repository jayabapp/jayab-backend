/*
  Warnings:

  - You are about to drop the column `advisorId` on the `cities` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "cities" DROP CONSTRAINT "cities_advisorId_fkey";

-- AlterTable
ALTER TABLE "_AttachmentToSubmittedFormItems" ADD CONSTRAINT "_AttachmentToSubmittedFormItems_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_AttachmentToSubmittedFormItems_AB_unique";

-- AlterTable
ALTER TABLE "_Property" ADD CONSTRAINT "_Property_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_Property_AB_unique";

-- AlterTable
ALTER TABLE "_PropertyAuthDocsImage" ADD CONSTRAINT "_PropertyAuthDocsImage_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PropertyAuthDocsImage_AB_unique";

-- AlterTable
ALTER TABLE "_Property_Temp" ADD CONSTRAINT "_Property_Temp_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_Property_Temp_AB_unique";

-- AlterTable
ALTER TABLE "cities" DROP COLUMN "advisorId";

-- CreateTable
CREATE TABLE "_AdvisorToCity" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AdvisorToCity_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AdvisorToCity_B_index" ON "_AdvisorToCity"("B");

-- AddForeignKey
ALTER TABLE "_AdvisorToCity" ADD CONSTRAINT "_AdvisorToCity_A_fkey" FOREIGN KEY ("A") REFERENCES "advisors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdvisorToCity" ADD CONSTRAINT "_AdvisorToCity_B_fkey" FOREIGN KEY ("B") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
