-- CreateTable
CREATE TABLE "landing_pages" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content_category_id" INTEGER,
    "url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "show_in_home" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "province_id" INTEGER,
    "city_id" INTEGER,
    "has_pool" BOOLEAN NOT NULL DEFAULT false,
    "property_type" INTEGER,
    "min_discount_percentage" SMALLINT NOT NULL,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "min_price" INTEGER,
    "max_price" INTEGER,
    "min_bedroom" INTEGER,
    "max_bedroom" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landing_pages_url_key" ON "landing_pages"("url");
