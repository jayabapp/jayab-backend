-- CreateTable
CREATE TABLE "messenger_chatrooms" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "property_id" INTEGER,
    "last_message_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messenger_chatrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messenger_participants" (
    "id" SERIAL NOT NULL,
    "chatroom_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "message_read_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "messenger_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messenger_messages" (
    "id" SERIAL NOT NULL,
    "chatroom_id" INTEGER NOT NULL,
    "participant_id" INTEGER,
    "text" TEXT,
    "media_id" INTEGER,
    "third_party" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "messenger_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "messenger_chatrooms_uuid_key" ON "messenger_chatrooms"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "messenger_chatrooms_property_id_key" ON "messenger_chatrooms"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "messenger_chatrooms_last_message_id_key" ON "messenger_chatrooms"("last_message_id");

-- CreateIndex
CREATE UNIQUE INDEX "messenger_participants_chatroom_id_user_id_role_key" ON "messenger_participants"("chatroom_id", "user_id", "role");

-- AddForeignKey
ALTER TABLE "messenger_chatrooms" ADD CONSTRAINT "messenger_chatrooms_last_message_id_fkey" FOREIGN KEY ("last_message_id") REFERENCES "messenger_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messenger_chatrooms" ADD CONSTRAINT "messenger_chatrooms_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messenger_participants" ADD CONSTRAINT "messenger_participants_chatroom_id_fkey" FOREIGN KEY ("chatroom_id") REFERENCES "messenger_chatrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messenger_messages" ADD CONSTRAINT "messenger_messages_chatroom_id_fkey" FOREIGN KEY ("chatroom_id") REFERENCES "messenger_chatrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messenger_messages" ADD CONSTRAINT "messenger_messages_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "messenger_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messenger_messages" ADD CONSTRAINT "messenger_messages_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
