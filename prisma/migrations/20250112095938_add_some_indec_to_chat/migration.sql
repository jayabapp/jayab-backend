/*
  Warnings:

  - You are about to drop the column `last_message_id` on the `messenger_chatrooms` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "messenger_chatrooms" DROP CONSTRAINT "messenger_chatrooms_last_message_id_fkey";

-- DropIndex
DROP INDEX "messenger_chatrooms_last_message_id_key";

-- DropIndex
DROP INDEX "messenger_chatrooms_property_id_key";

-- AlterTable
ALTER TABLE "messenger_chatrooms" DROP COLUMN "last_message_id";

-- CreateIndex
CREATE INDEX "messenger_chatrooms_property_id_idx" ON "messenger_chatrooms"("property_id");

-- CreateIndex
CREATE INDEX "messenger_messages_chatroom_id_participant_id_idx" ON "messenger_messages"("chatroom_id", "participant_id");

-- CreateIndex
CREATE INDEX "messenger_participants_chatroom_id_user_id_idx" ON "messenger_participants"("chatroom_id", "user_id");
