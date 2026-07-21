-- CreateTable
CREATE TABLE "advisor_shares" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(10) NOT NULL,
    "property_id" INTEGER NOT NULL,
    "advisor_id" INTEGER NOT NULL,
    "elements" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advisor_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "advisor_shares_key_key" ON "advisor_shares"("key");
