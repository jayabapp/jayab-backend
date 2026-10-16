-- Persian stays canonical. Admin-entered en/ar editions of the free-text descriptions and the host name.
ALTER TABLE "property_descriptions" ADD COLUMN "translations" JSONB;
ALTER TABLE "properties" ADD COLUMN "host_translations" JSONB;
