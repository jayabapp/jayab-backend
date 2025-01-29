/*
  Warnings:

  - A unique constraint covering the columns `[last_message_id]` on the table `messenger_chatrooms` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "messenger_chatrooms" ADD COLUMN     "last_message_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "messenger_chatrooms_last_message_id_key" ON "messenger_chatrooms"("last_message_id");

-- AddForeignKey
ALTER TABLE "messenger_chatrooms" ADD CONSTRAINT "messenger_chatrooms_last_message_id_fkey" FOREIGN KEY ("last_message_id") REFERENCES "messenger_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
