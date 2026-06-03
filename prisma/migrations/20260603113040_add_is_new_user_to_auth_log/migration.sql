-- AlterTable
ALTER TABLE "public"."auth_logs" ADD COLUMN     "is_new_user" BOOLEAN NOT NULL DEFAULT false;
