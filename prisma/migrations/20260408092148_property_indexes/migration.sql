-- DropIndex
DROP INDEX "public"."properties_id_sort_order_code_advisor_commission_idx";

-- CreateIndex
CREATE INDEX "options_on_property_property_id_option_id_idx" ON "public"."options_on_property"("property_id", "option_id");

-- CreateIndex
CREATE INDEX "properties_id_idx" ON "public"."properties"("id");

-- CreateIndex
CREATE INDEX "properties_code_idx" ON "public"."properties"("code");

-- CreateIndex
CREATE INDEX "properties_has_pool_idx" ON "public"."properties"("has_pool");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "public"."properties"("status");

-- CreateIndex
CREATE INDEX "properties_sort_order_idx" ON "public"."properties"("sort_order");

-- CreateIndex
CREATE INDEX "properties_advisor_commission_idx" ON "public"."properties"("advisor_commission");

-- CreateIndex
CREATE INDEX "properties_is_authorized_idx" ON "public"."properties"("is_authorized");

-- CreateIndex
CREATE INDEX "properties_province_id_idx" ON "public"."properties"("province_id");

-- CreateIndex
CREATE INDEX "properties_city_id_idx" ON "public"."properties"("city_id");

-- CreateIndex
CREATE INDEX "properties_region_id_idx" ON "public"."properties"("region_id");

-- CreateIndex
CREATE INDEX "properties_owner_id_idx" ON "public"."properties"("owner_id");

-- CreateIndex
CREATE INDEX "property_authorize_property_id_idx" ON "public"."property_authorize"("property_id");

-- CreateIndex
CREATE INDEX "property_bedrooms_property_id_idx" ON "public"."property_bedrooms"("property_id");

-- CreateIndex
CREATE INDEX "property_daily_prices_property_id_idx" ON "public"."property_daily_prices"("property_id");

-- CreateIndex
CREATE INDEX "property_descriptions_property_id_idx" ON "public"."property_descriptions"("property_id");

-- CreateIndex
CREATE INDEX "property_options_group_idx" ON "public"."property_options"("group");

-- CreateIndex
CREATE INDEX "property_owner_assistants_property_id_idx" ON "public"."property_owner_assistants"("property_id");


-- Create a GIN index on the array column
CREATE INDEX "properties_options_array_idx"
ON "properties"
USING GIN ("options_array");
