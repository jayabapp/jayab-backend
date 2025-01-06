-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "has_blue_tick" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_authorized" BOOLEAN NOT NULL DEFAULT false;
