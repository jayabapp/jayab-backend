-- CreateTable
CREATE TABLE "property_reserved_days" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "day" SMALLINT NOT NULL,
    "month" SMALLINT NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_reserved_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_reserved_days_property_id_day_month_year_idx" ON "property_reserved_days"("property_id", "day", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "property_reserved_days_property_id_day_month_year_key" ON "property_reserved_days"("property_id", "day", "month", "year");

-- AddForeignKey
ALTER TABLE "property_reserved_days" ADD CONSTRAINT "property_reserved_days_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
