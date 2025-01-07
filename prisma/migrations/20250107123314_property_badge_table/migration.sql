-- CreateTable
CREATE TABLE "property_badges" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "changelog" JSONB[],
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_badges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_badges_property_id_key" ON "property_badges"("property_id");

-- CreateIndex
CREATE INDEX "property_badges_property_id_idx" ON "property_badges"("property_id");

-- AddForeignKey
ALTER TABLE "property_badges" ADD CONSTRAINT "property_badges_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
