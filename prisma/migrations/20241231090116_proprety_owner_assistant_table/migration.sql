-- CreateTable
CREATE TABLE "property_owner_assistants" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "owner_mobile_number" VARCHAR(11),
    "assistant_mobile_number" VARCHAR(11),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_owner_assistants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_owner_assistants_owner_mobile_number_key" ON "property_owner_assistants"("owner_mobile_number");

-- CreateIndex
CREATE UNIQUE INDEX "property_owner_assistants_assistant_mobile_number_key" ON "property_owner_assistants"("assistant_mobile_number");

-- AddForeignKey
ALTER TABLE "property_owner_assistants" ADD CONSTRAINT "property_owner_assistants_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
