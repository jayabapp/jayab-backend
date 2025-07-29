-- CreateTable
CREATE TABLE "call_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "property_id" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "call_logs_user_id_property_id_idx" ON "call_logs"("user_id", "property_id");

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
