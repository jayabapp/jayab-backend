-- CreateTable
CREATE TABLE "property_calendar" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "day" SMALLINT NOT NULL,
    "month" SMALLINT NOT NULL,
    "year" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "note" VARCHAR,
    "is_reserved" BOOLEAN NOT NULL DEFAULT false,
    "price" INTEGER,
    "discounted_price" INTEGER,
    "effective_price" INTEGER,
    "advisor_commission" SMALLINT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_calendar_property_id_idx" ON "property_calendar"("property_id");

-- CreateIndex
CREATE INDEX "property_calendar_date_idx" ON "property_calendar"("date");

-- CreateIndex
CREATE INDEX "property_calendar_day_month_year_idx" ON "property_calendar"("day", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "property_calendar_property_id_day_month_year_key" ON "property_calendar"("property_id", "day", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "property_calendar_property_id_date_key" ON "property_calendar"("property_id", "date");

-- AddForeignKey
ALTER TABLE "property_calendar" ADD CONSTRAINT "property_calendar_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
