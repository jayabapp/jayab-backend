-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "promoted_at" TIMESTAMP(3),
ADD COLUMN     "subscription_expired_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "advisor_id" INTEGER,
    "subscription_id" INTEGER,
    "gateway_key" TEXT,
    "amount" INTEGER NOT NULL,
    "pay_by_wallet" INTEGER,
    "pay_by_gateway" INTEGER,
    "debt" INTEGER,
    "gate" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "ref_id" TEXT,
    "type" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "description" TEXT,
    "redirect_url" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_gateways" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "params" JSONB[],
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnovers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "turnoverable_id" INTEGER,
    "turnoverable_type" TEXT,
    "amount" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnovers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateways_key_key" ON "payment_gateways"("key");

-- CreateIndex
CREATE INDEX "properties_id_code_advisor_commission_idx" ON "properties"("id", "code", "advisor_commission");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_gateway_key_fkey" FOREIGN KEY ("gateway_key") REFERENCES "payment_gateways"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnovers" ADD CONSTRAINT "turnovers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
