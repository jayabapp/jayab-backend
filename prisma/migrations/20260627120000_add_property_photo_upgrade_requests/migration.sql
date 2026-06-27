-- CreateTable
CREATE TABLE "property_photo_upgrade_requests" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "subscription_id" INTEGER,
    "payment_id" INTEGER,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "image_count" SMALLINT NOT NULL DEFAULT 0,
    "price_per_image" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_photo_upgrade_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_photo_upgrade_request_items" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "attachment_id" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "edited_at" TIMESTAMP(3),
    "edited_by_admin_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_photo_upgrade_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_photo_upgrade_requests_subscription_id_key" ON "property_photo_upgrade_requests"("subscription_id");

-- CreateIndex
CREATE INDEX "property_photo_upgrade_requests_property_id_idx" ON "property_photo_upgrade_requests"("property_id");

-- CreateIndex
CREATE INDEX "property_photo_upgrade_requests_owner_id_idx" ON "property_photo_upgrade_requests"("owner_id");

-- CreateIndex
CREATE INDEX "property_photo_upgrade_requests_payment_id_idx" ON "property_photo_upgrade_requests"("payment_id");

-- CreateIndex
CREATE INDEX "property_photo_upgrade_requests_status_idx" ON "property_photo_upgrade_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "property_photo_upgrade_request_items_request_id_attachment_id_key" ON "property_photo_upgrade_request_items"("request_id", "attachment_id");

-- CreateIndex
CREATE INDEX "property_photo_upgrade_request_items_request_id_idx" ON "property_photo_upgrade_request_items"("request_id");

-- CreateIndex
CREATE INDEX "property_photo_upgrade_request_items_attachment_id_idx" ON "property_photo_upgrade_request_items"("attachment_id");

-- CreateIndex
CREATE INDEX "property_photo_upgrade_request_items_status_idx" ON "property_photo_upgrade_request_items"("status");

-- AddForeignKey
ALTER TABLE "property_photo_upgrade_requests" ADD CONSTRAINT "property_photo_upgrade_requests_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_photo_upgrade_requests" ADD CONSTRAINT "property_photo_upgrade_requests_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_photo_upgrade_requests" ADD CONSTRAINT "property_photo_upgrade_requests_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_photo_upgrade_requests" ADD CONSTRAINT "property_photo_upgrade_requests_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_photo_upgrade_request_items" ADD CONSTRAINT "property_photo_upgrade_request_items_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "property_photo_upgrade_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_photo_upgrade_request_items" ADD CONSTRAINT "property_photo_upgrade_request_items_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_photo_upgrade_request_items" ADD CONSTRAINT "property_photo_upgrade_request_items_edited_by_admin_id_fkey" FOREIGN KEY ("edited_by_admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
