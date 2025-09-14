-- CreateTable
CREATE TABLE "public"."redirect_urls" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "permanent" BOOLEAN NOT NULL DEFAULT true,
    "source_hash" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "redirect_urls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "redirect_urls_source_hash_key" ON "public"."redirect_urls"("source_hash");

-- CreateIndex
CREATE INDEX "redirect_urls_source_hash_idx" ON "public"."redirect_urls"("source_hash");
