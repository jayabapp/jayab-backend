-- CreateTable
CREATE TABLE "public"."property_reserves" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "check_in" DATE NOT NULL,
    "check_out" DATE NOT NULL,
    "guests_count" TEXT NOT NULL,
    "owner_seen_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "owner_called_at" TIMESTAMP(3),
    "description" TEXT,
    "owner_clicked_guest_mobile" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_reserves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_reserves_property_id_idx" ON "public"."property_reserves"("property_id");

-- CreateIndex
CREATE INDEX "property_reserves_user_id_idx" ON "public"."property_reserves"("user_id");

-- CreateIndex
CREATE INDEX "property_reserves_created_at_idx" ON "public"."property_reserves"("created_at");

-- CreateIndex
CREATE INDEX "messenger_black_list_blocked_id_idx" ON "public"."messenger_black_list"("blocked_id");

-- CreateIndex
CREATE INDEX "messenger_black_list_blocker_id_idx" ON "public"."messenger_black_list"("blocker_id");

-- CreateIndex
CREATE INDEX "messenger_chatrooms_uuid_idx" ON "public"."messenger_chatrooms"("uuid");

-- CreateIndex
CREATE INDEX "messenger_chatrooms_created_at_idx" ON "public"."messenger_chatrooms"("created_at");

-- CreateIndex
CREATE INDEX "messenger_messages_created_at_idx" ON "public"."messenger_messages"("created_at");

-- CreateIndex
CREATE INDEX "messenger_messages_chatroom_id_idx" ON "public"."messenger_messages"("chatroom_id");

-- CreateIndex
CREATE INDEX "messenger_messages_participant_id_idx" ON "public"."messenger_messages"("participant_id");

-- CreateIndex
CREATE INDEX "messenger_participants_chatroom_id_idx" ON "public"."messenger_participants"("chatroom_id");

-- CreateIndex
CREATE INDEX "messenger_participants_user_id_idx" ON "public"."messenger_participants"("user_id");

-- AddForeignKey
ALTER TABLE "public"."property_reserves" ADD CONSTRAINT "property_reserves_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."property_reserves" ADD CONSTRAINT "property_reserves_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
