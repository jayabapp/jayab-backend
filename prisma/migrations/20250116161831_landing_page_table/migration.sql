-- CreateTable
CREATE TABLE "landing_pages" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL, 
    "content_category_id" INTEGER,
    "url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "show_in_home" BOOLEAN NOT NULL DEFAULT false,
    "options" INTEGER[],
    "province_id" INTEGER,
    "cities" INTEGER[],
    "has_pool" BOOLEAN NOT NULL DEFAULT false,
    "property_type" INTEGER,
    "min_discount_percentage" SMALLINT,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "min_price" INTEGER,
    "max_price" INTEGER,
    "min_bedroom" INTEGER,
    "max_bedroom" INTEGER,
    "image_id" INTEGER,
    "sort_order" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landing_pages_url_key" ON "landing_pages"("url");

-- AddForeignKey
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
