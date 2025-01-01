-- CreateTable
CREATE TABLE "messenger_black_list" (
    "id" SERIAL NOT NULL,
    "blocker_id" INTEGER NOT NULL,
    "blocked_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messenger_black_list_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "messenger_black_list_blocked_id_blocker_id_key" ON "messenger_black_list"("blocked_id", "blocker_id");

-- AddForeignKey
ALTER TABLE "messenger_black_list" ADD CONSTRAINT "messenger_black_list_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
