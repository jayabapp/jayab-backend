/*
  Warnings:

  - You are about to drop the column `owner_mobile_number` on the `property_owner_assistants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "property_owner_assistants" DROP COLUMN "owner_mobile_number",
ADD COLUMN     "is_owner" BOOLEAN DEFAULT false;
