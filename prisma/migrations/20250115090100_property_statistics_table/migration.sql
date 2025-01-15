-- CreateTable
CREATE TABLE "property_statistics" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_statistics_property_id_date_idx" ON "property_statistics"("property_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "property_statistics_property_id_date_key" ON "property_statistics"("property_id", "date");
