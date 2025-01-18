-- AlterTable
ALTER TABLE "advisors" ADD COLUMN     "advisor_behavior" INTEGER,
ADD COLUMN     "advisor_responsibility" INTEGER,
ADD COLUMN     "owners_satisfaction" INTEGER,
ADD COLUMN     "response_speed_and_followup" INTEGER,
ADD COLUMN     "users_satisfaction" INTEGER;

-- CreateTable
CREATE TABLE "rates" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "advisor_id" INTEGER NOT NULL,
    "advisor_behavior" SMALLINT,
    "advisor_responsibility" SMALLINT,
    "response_speed_and_followup" SMALLINT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rates_user_id_advisor_id_key" ON "rates"("user_id", "advisor_id");
