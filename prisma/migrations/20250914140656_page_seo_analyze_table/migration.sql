-- CreateTable
CREATE TABLE "public"."page_seo_analyzes" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "url_sha1" TEXT NOT NULL,
    "h1_count" INTEGER,
    "h2_count" INTEGER,
    "meta_title_length" INTEGER,
    "meta_description_length" INTEGER,
    "canonical" TEXT,
    "schemas" JSON[],
    "no_alt_images" TEXT[],
    "h1_array" TEXT[],
    "scraper_flag" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_seo_analyzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."page_seo_link_analyzes" (
    "id" SERIAL NOT NULL,
    "page_id" INTEGER NOT NULL,
    "href" TEXT NOT NULL,
    "rel" TEXT,
    "is_internal" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_seo_link_analyzes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_seo_analyzes_url_key" ON "public"."page_seo_analyzes"("url");

-- CreateIndex
CREATE UNIQUE INDEX "page_seo_analyzes_url_sha1_key" ON "public"."page_seo_analyzes"("url_sha1");

-- CreateIndex
CREATE INDEX "page_seo_analyzes_url_sha1_idx" ON "public"."page_seo_analyzes"("url_sha1");

-- CreateIndex
CREATE INDEX "page_seo_link_analyzes_page_id_idx" ON "public"."page_seo_link_analyzes"("page_id");

-- AddForeignKey
ALTER TABLE "public"."page_seo_link_analyzes" ADD CONSTRAINT "page_seo_link_analyzes_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."page_seo_analyzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
