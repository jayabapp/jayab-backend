-- Add admin relation
ALTER TABLE "notifications" ADD COLUMN "admin_id" INTEGER;

-- Move existing admin notification recipients to the dedicated column
UPDATE "notifications"
SET "admin_id" = "user_id", "user_id" = NULL
WHERE "role" = 'admin';

-- CreateIndex
CREATE INDEX "notifications_admin_id_idx" ON "notifications"("admin_id");

-- AddForeignKey
ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_admin_id_fkey"
FOREIGN KEY ("admin_id") REFERENCES "admins"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
