/*
  Warnings:

  - Added the required column `user_action` to the `property_reserves` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."property_reserves" ADD COLUMN     "owner_seen_at" TIMESTAMP(3),
ADD COLUMN     "user_action" SMALLINT NOT NULL;
