-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" SERIAL NOT NULL,
    "group" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "price_with_discount" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);
