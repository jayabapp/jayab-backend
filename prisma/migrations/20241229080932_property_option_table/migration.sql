-- CreateTable
CREATE TABLE "property_options" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" VARCHAR(256),
    "group" TEXT NOT NULL,
    "sort" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "property_options_pkey" PRIMARY KEY ("id")
);
