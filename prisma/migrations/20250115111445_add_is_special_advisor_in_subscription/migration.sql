-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "advisor_id" INTEGER,
ADD COLUMN     "is_special_advisor" BOOLEAN;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_advisor_id_fkey" FOREIGN KEY ("advisor_id") REFERENCES "advisors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
