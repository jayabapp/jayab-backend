-- CreateTable
CREATE TABLE "peak_days" (
    "id" SERIAL NOT NULL,
    "day" SMALLINT NOT NULL,
    "month" SMALLINT NOT NULL,
    "year" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peak_days_pkey" PRIMARY KEY ("id")
);
