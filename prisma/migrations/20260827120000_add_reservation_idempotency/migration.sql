ALTER TABLE "property_reserves"
ADD COLUMN "idempotency_key" VARCHAR(100);

CREATE UNIQUE INDEX "property_reserves_user_id_idempotency_key_key"
ON "property_reserves"("user_id", "idempotency_key");
