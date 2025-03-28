-- AlterTable
ALTER TABLE "subscription_reminders" ADD COLUMN     "sent_at" DATE,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);
