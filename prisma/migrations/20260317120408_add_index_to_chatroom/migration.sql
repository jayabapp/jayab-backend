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
