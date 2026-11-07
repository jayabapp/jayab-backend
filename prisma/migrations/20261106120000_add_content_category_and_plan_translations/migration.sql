-- English and Arabic editions of content category texts and subscription plan texts.
-- Additive and nullable: the Persian columns stay the source and the fallback.
ALTER TABLE "content_categories" ADD COLUMN "translations" JSONB;
ALTER TABLE "subscription_plans" ADD COLUMN "translations" JSONB;
