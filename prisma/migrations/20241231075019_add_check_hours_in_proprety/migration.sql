-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "check_in_hour" SMALLINT,
ADD COLUMN     "check_out_hour" SMALLINT,
ALTER COLUMN "advisor_commission" SET DEFAULT 0;
