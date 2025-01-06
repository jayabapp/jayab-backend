-- CreateTable
CREATE TABLE "property_calendar_notes" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "day" SMALLINT NOT NULL,
    "month" SMALLINT NOT NULL,
    "year" INTEGER NOT NULL,
    "note" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_calendar_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_calendar_notes_property_id_day_month_year_idx" ON "property_calendar_notes"("property_id", "day", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "property_calendar_notes_property_id_day_month_year_key" ON "property_calendar_notes"("property_id", "day", "month", "year");

-- AddForeignKey
ALTER TABLE "property_calendar_notes" ADD CONSTRAINT "property_calendar_notes_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
