-- CreateTable
CREATE TABLE "public"."property_reserves" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "check_in" DATE NOT NULL,
    "check_out" DATE NOT NULL,
    "guests_count" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_reserves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_reserves_property_id_idx" ON "public"."property_reserves"("property_id");

-- CreateIndex
CREATE INDEX "property_reserves_user_id_idx" ON "public"."property_reserves"("user_id");

-- CreateIndex
CREATE INDEX "property_reserves_created_at_idx" ON "public"."property_reserves"("created_at");

-- AddForeignKey
ALTER TABLE "public"."property_reserves" ADD CONSTRAINT "property_reserves_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."property_reserves" ADD CONSTRAINT "property_reserves_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
