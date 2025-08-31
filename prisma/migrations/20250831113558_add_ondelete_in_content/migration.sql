-- DropForeignKey
ALTER TABLE "public"."content_attachments" DROP CONSTRAINT "content_attachments_attachment_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."content_attachments" DROP CONSTRAINT "content_attachments_content_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."content_questions" DROP CONSTRAINT "content_questions_content_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."content_attachments" ADD CONSTRAINT "content_attachments_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_attachments" ADD CONSTRAINT "content_attachments_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_questions" ADD CONSTRAINT "content_questions_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
