CREATE TYPE "TestAccessRole" AS ENUM ('TEAM_LEAD', 'QA');

CREATE TABLE "test_access_members" (
    "id" SERIAL NOT NULL,
    "mobile_number" VARCHAR(11) NOT NULL,
    "role" "TestAccessRole" NOT NULL DEFAULT 'QA',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_mobile" VARCHAR(11),
    "revoked_by_mobile" VARCHAR(11),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_access_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "test_access_members_mobile_number_key"
ON "test_access_members"("mobile_number");

CREATE INDEX "test_access_members_is_active_role_idx"
ON "test_access_members"("is_active", "role");
