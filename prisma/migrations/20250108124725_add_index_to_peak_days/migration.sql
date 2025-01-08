/*
  Warnings:

  - A unique constraint covering the columns `[day,month,year]` on the table `peak_days` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[date]` on the table `peak_days` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "peak_days_date_timestamp_idx" ON "peak_days"("date", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "peak_days_day_month_year_key" ON "peak_days"("day", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "peak_days_date_key" ON "peak_days"("date");
