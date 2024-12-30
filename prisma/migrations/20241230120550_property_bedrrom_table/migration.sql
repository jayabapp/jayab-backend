-- CreateTable
CREATE TABLE "property_bedrooms" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "bedrooms" INTEGER[],
    "additional_bed" INTEGER NOT NULL,
    "master_room" INTEGER NOT NULL,
    "sofa_bed" INTEGER NOT NULL,
    "wc" INTEGER DEFAULT 0,
    "wc_ir" INTEGER DEFAULT 0,
    "bathroom_master" INTEGER DEFAULT 0,
    "bathroom_general" INTEGER DEFAULT 0,
    "bathroom_in_wc" INTEGER DEFAULT 0,
    "bathroom_tub" INTEGER DEFAULT 0,
    "total_bedrooms" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_bedrooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_bedrooms_property_id_key" ON "property_bedrooms"("property_id");

-- AddForeignKey
ALTER TABLE "property_bedrooms" ADD CONSTRAINT "property_bedrooms_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
