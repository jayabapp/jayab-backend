-- CreateTable
CREATE TABLE "public"."auth_logs" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ua" TEXT,
    "ua_parsed" JSONB,
    "ip_address" TEXT,
    "redirect_url" TEXT,
    "utm_source" VARCHAR(255),
    "utm_medium" VARCHAR(255),
    "utm_campaign" VARCHAR(255),
    "utm_term" VARCHAR(255),
    "utm_content" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_logs_user_id_idx" ON "public"."auth_logs"("user_id");

-- CreateIndex
CREATE INDEX "auth_logs_created_at_idx" ON "public"."auth_logs"("created_at");

-- AddForeignKey
ALTER TABLE "public"."auth_logs" ADD CONSTRAINT "auth_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
