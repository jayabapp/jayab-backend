-- AlterTable
ALTER TABLE "public"."property_reserves" ADD COLUMN     "canceled_at" TIMESTAMP(3),
ADD COLUMN     "expired_at" TIMESTAMP(3);
