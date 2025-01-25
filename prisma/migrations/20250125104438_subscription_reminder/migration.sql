-- CreateTable
CREATE TABLE "subscription_reminders" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER,
    "advisor_id" INTEGER,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_reminders_pkey" PRIMARY KEY ("id")
);
