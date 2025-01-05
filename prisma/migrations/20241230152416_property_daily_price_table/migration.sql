-- CreateTable
CREATE TABLE "property_daily_prices" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "normal" INTEGER NOT NULL,
    "wednesday" INTEGER NOT NULL,
    "thursday" INTEGER NOT NULL,
    "friday" INTEGER NOT NULL,
    "peak" INTEGER NOT NULL,
    "cleaning" INTEGER DEFAULT 0,
    "additional_person" INTEGER NOT NULL,
    "today_offer" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "property_daily_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_daily_prices_property_id_key" ON "property_daily_prices"("property_id");

-- AddForeignKey
ALTER TABLE
    "property_daily_prices"
ADD
    CONSTRAINT "property_daily_prices_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;