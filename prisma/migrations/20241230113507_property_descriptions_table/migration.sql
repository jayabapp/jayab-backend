-- CreateTable
CREATE TABLE "property_descriptions" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "property_dscr" TEXT,
    "pattern_dscr" TEXT,
    "distance_dscr" TEXT,
    "facility_dscr" TEXT,
    "guest_dscr" TEXT,
    "pet_dscr" TEXT,
    "party_dscr" TEXT,
    "doc_dscr" TEXT,
    "other_dscr" TEXT,
    "ad_dscr" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_descriptions_property_id_key" ON "property_descriptions"("property_id");

-- AddForeignKey
ALTER TABLE "property_descriptions" ADD CONSTRAINT "property_descriptions_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
