/*
  Warnings:

  - Made the column `participant_id` on table `messenger_messages` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "messenger_black_list" DROP CONSTRAINT "messenger_black_list_blocked_id_fkey";

-- DropForeignKey
ALTER TABLE "messenger_chatrooms" DROP CONSTRAINT "messenger_chatrooms_property_id_fkey";

-- DropForeignKey
ALTER TABLE "messenger_messages" DROP CONSTRAINT "messenger_messages_chatroom_id_fkey";

-- DropForeignKey
ALTER TABLE "messenger_messages" DROP CONSTRAINT "messenger_messages_participant_id_fkey";

-- DropForeignKey
ALTER TABLE "messenger_participants" DROP CONSTRAINT "messenger_participants_chatroom_id_fkey";

-- AlterTable
ALTER TABLE "messenger_messages" ALTER COLUMN "participant_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "messenger_chatrooms" ADD CONSTRAINT "messenger_chatrooms_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messenger_participants" ADD CONSTRAINT "messenger_participants_chatroom_id_fkey" FOREIGN KEY ("chatroom_id") REFERENCES "messenger_chatrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messenger_messages" ADD CONSTRAINT "messenger_messages_chatroom_id_fkey" FOREIGN KEY ("chatroom_id") REFERENCES "messenger_chatrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messenger_messages" ADD CONSTRAINT "messenger_messages_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "messenger_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messenger_black_list" ADD CONSTRAINT "messenger_black_list_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
