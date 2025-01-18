-- CreateTable
CREATE TABLE "rates" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "advisor_id" INTEGER NOT NULL,
    "advisor_behavior" SMALLINT NOT NULL,
    "advisor_responsibility" SMALLINT NOT NULL,
    "response_speed_and_followup" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rates_user_id_advisor_id_key" ON "rates"("user_id", "advisor_id");
