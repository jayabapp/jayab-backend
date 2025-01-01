-- DropIndex
DROP INDEX "property_owner_assistants_assistant_mobile_number_key";

-- DropIndex
DROP INDEX "property_owner_assistants_owner_mobile_number_key";

-- AlterTable
ALTER TABLE "property_owner_assistants" ADD COLUMN     "assistant_full_name" TEXT;
