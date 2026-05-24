/*
  Warnings:

  - You are about to drop the column `browser_name` on the `auth_logs` table. All the data in the column will be lost.
  - You are about to drop the column `browser_version` on the `auth_logs` table. All the data in the column will be lost.
  - You are about to drop the column `device_brand` on the `auth_logs` table. All the data in the column will be lost.
  - You are about to drop the column `device_model` on the `auth_logs` table. All the data in the column will be lost.
  - You are about to drop the column `device_type` on the `auth_logs` table. All the data in the column will be lost.
  - You are about to drop the column `os_name` on the `auth_logs` table. All the data in the column will be lost.
  - You are about to drop the column `os_version` on the `auth_logs` table. All the data in the column will be lost.
  - You are about to drop the column `user_agent` on the `auth_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."auth_logs" DROP COLUMN "browser_name",
DROP COLUMN "browser_version",
DROP COLUMN "device_brand",
DROP COLUMN "device_model",
DROP COLUMN "device_type",
DROP COLUMN "os_name",
DROP COLUMN "os_version",
DROP COLUMN "user_agent",
ADD COLUMN     "ua" TEXT,
ADD COLUMN     "ua_parsed" JSONB;
