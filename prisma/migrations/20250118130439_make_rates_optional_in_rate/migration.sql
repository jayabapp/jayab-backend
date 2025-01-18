-- AlterTable
ALTER TABLE "rates" ALTER COLUMN "advisor_behavior" DROP NOT NULL,
ALTER COLUMN "advisor_responsibility" DROP NOT NULL,
ALTER COLUMN "response_speed_and_followup" DROP NOT NULL;
