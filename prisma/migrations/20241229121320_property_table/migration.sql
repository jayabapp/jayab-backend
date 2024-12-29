-- CreateTable
CREATE TABLE "properties" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "title" TEXT,
    "land_area" INTEGER,
    "building_area" INTEGER,
    "floors" INTEGER,
    "unit_per_floor" INTEGER,
    "floor" INTEGER,
    "construction_year" INTEGER,
    "region_id" INTEGER,
    "province_id" INTEGER,
    "city_id" INTEGER,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "status" SMALLINT NOT NULL,
    "is_chat_enabled" BOOLEAN,
    "is_location_visible" BOOLEAN,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options_on_property" (
    "property_id" INTEGER NOT NULL,
    "option_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "options_on_property_pkey" PRIMARY KEY ("property_id","option_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "properties_code_key" ON "properties"("code");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options_on_property" ADD CONSTRAINT "options_on_property_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options_on_property" ADD CONSTRAINT "options_on_property_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "property_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
