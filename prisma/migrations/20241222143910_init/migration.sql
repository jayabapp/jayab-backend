-- CreateTable
CREATE TABLE "generator_base" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "generator_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" SERIAL NOT NULL,
    "mobile_number" VARCHAR(11) NOT NULL,
    "attempts" SMALLINT NOT NULL DEFAULT 0,
    "code" TEXT NOT NULL,
    "sms_send_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(64) NOT NULL,
    "password" VARCHAR NOT NULL,
    "full_name" VARCHAR(64) NOT NULL,
    "mobile_number" VARCHAR(11) NOT NULL,
    "role_id" SMALLINT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_control_modules" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(64) NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_control_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_control_roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "key" TEXT,
    "tree" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "access_control_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_control_list" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "c" BOOLEAN NOT NULL DEFAULT false,
    "r" BOOLEAN NOT NULL DEFAULT false,
    "u" BOOLEAN NOT NULL DEFAULT false,
    "d" BOOLEAN NOT NULL DEFAULT false,
    "v" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_control_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_role_notification_permissions" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permissions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_role_notification_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_activities" (
    "id" SERIAL NOT NULL,
    "os" VARCHAR(32),
    "browser" VARCHAR(32),
    "browser_ver" VARCHAR(32),
    "ip_v4" VARCHAR(16),
    "admin_id" INTEGER NOT NULL,
    "module" VARCHAR(32) NOT NULL,
    "path" VARCHAR NOT NULL,
    "method" VARCHAR(8) NOT NULL,
    "className" VARCHAR(128) NOT NULL,
    "classMethod" VARCHAR(128) NOT NULL,
    "param" JSONB,
    "query" JSONB,
    "body" JSONB,
    "result_id" INTEGER,
    "status_code" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "admin_id" INTEGER,
    "user_role" TEXT,
    "name" VARCHAR NOT NULL,
    "meta" VARCHAR,
    "thumbnail" TEXT,
    "type" INTEGER NOT NULL DEFAULT 1,
    "path" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "region" TEXT,
    "end_point" TEXT NOT NULL,
    "medium" TEXT,
    "alt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_categories" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "slug" TEXT NOT NULL,
    "key" VARCHAR(64) NOT NULL,
    "image_id" INTEGER,
    "dynamic_fields" JSONB,
    "parent_id" INTEGER,
    "description" TEXT,
    "html" TEXT,
    "show_in_sitemap" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contents" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "slug" TEXT,
    "key" VARCHAR(64),
    "small_text" TEXT,
    "full_text" TEXT,
    "feature_image_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "category_id" INTEGER,
    "order" INTEGER,
    "html" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "link" TEXT,
    "video_id" INTEGER,
    "show_in_sitemap" BOOLEAN NOT NULL DEFAULT true,
    "fields" JSONB,
    "seo" JSONB,
    "form_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_attachments" (
    "id" SERIAL NOT NULL,
    "content_id" INTEGER NOT NULL,
    "attachment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "content_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_questions" (
    "id" SERIAL NOT NULL,
    "content_id" INTEGER,
    "content_category_id" INTEGER,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "image_id" INTEGER,
    "admin_id" INTEGER,
    "rate" INTEGER,
    "author_name" TEXT,
    "mobile_number" TEXT,
    "is_publish" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "parent_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "max" INTEGER,
    "min" INTEGER,
    "data_type" TEXT NOT NULL DEFAULT 'NUMBER',
    "sort_order" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "link" TEXT,
    "category_id" INTEGER,
    "product_id" INTEGER,
    "brand_id" INTEGER,
    "position" TEXT NOT NULL,
    "sort_order" INTEGER,
    "image_id" INTEGER NOT NULL,
    "image_sm_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER,
    "title" VARCHAR NOT NULL,
    "key" VARCHAR,
    "image_id" INTEGER,
    "sort_order" SMALLINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "path" TEXT NOT NULL,
    "hex_color" TEXT,
    "is_feature_category" BOOLEAN NOT NULL DEFAULT false,
    "feature_title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "mobile_number" VARCHAR(11) NOT NULL,
    "full_name" VARCHAR,
    "avatar_id" INTEGER,
    "fcm_token" TEXT,
    "jwt_level" INTEGER NOT NULL DEFAULT 1,
    "notification_read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_builder" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content_id" INTEGER,
    "options" JSONB NOT NULL DEFAULT '[]',
    "key" TEXT,
    "sort_order" INTEGER,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "form_builder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submitted_forms" (
    "id" SERIAL NOT NULL,
    "content_id" INTEGER,
    "mobile_number" VARCHAR(11),
    "full_name" VARCHAR,
    "ip" VARCHAR,
    "status" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submitted_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submitted_form_items" (
    "id" SERIAL NOT NULL,
    "submitted_form_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submitted_form_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AttachmentToSubmittedFormItems" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "otps_mobile_number_key" ON "otps"("mobile_number");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admins_mobile_number_key" ON "admins"("mobile_number");

-- CreateIndex
CREATE UNIQUE INDEX "access_control_modules_key_key" ON "access_control_modules"("key");

-- CreateIndex
CREATE UNIQUE INDEX "access_control_roles_name_key" ON "access_control_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "access_control_roles_key_key" ON "access_control_roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "access_control_list_module_id_role_id_key" ON "access_control_list"("module_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_role_notification_permissions_role_id_key" ON "admin_role_notification_permissions"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_categories_slug_key" ON "content_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "content_categories_key_key" ON "content_categories"("key");

-- CreateIndex
CREATE UNIQUE INDEX "contents_slug_key" ON "contents"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "categories_key_key" ON "categories"("key");

-- CreateIndex
CREATE UNIQUE INDEX "categories_image_id_key" ON "categories"("image_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_number_key" ON "users"("mobile_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_avatar_id_key" ON "users"("avatar_id");

-- CreateIndex
CREATE UNIQUE INDEX "_AttachmentToSubmittedFormItems_AB_unique" ON "_AttachmentToSubmittedFormItems"("A", "B");

-- CreateIndex
CREATE INDEX "_AttachmentToSubmittedFormItems_B_index" ON "_AttachmentToSubmittedFormItems"("B");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "access_control_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_control_list" ADD CONSTRAINT "access_control_list_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "access_control_modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_control_list" ADD CONSTRAINT "access_control_list_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "access_control_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_role_notification_permissions" ADD CONSTRAINT "admin_role_notification_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "access_control_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_categories" ADD CONSTRAINT "content_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "content_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_categories" ADD CONSTRAINT "content_categories_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "content_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_feature_image_id_fkey" FOREIGN KEY ("feature_image_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_attachments" ADD CONSTRAINT "content_attachments_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_attachments" ADD CONSTRAINT "content_attachments_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_questions" ADD CONSTRAINT "content_questions_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_questions" ADD CONSTRAINT "content_questions_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_questions" ADD CONSTRAINT "content_questions_content_category_id_fkey" FOREIGN KEY ("content_category_id") REFERENCES "content_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_questions" ADD CONSTRAINT "content_questions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_image_sm_id_fkey" FOREIGN KEY ("image_sm_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_builder" ADD CONSTRAINT "form_builder_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submitted_forms" ADD CONSTRAINT "submitted_forms_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submitted_form_items" ADD CONSTRAINT "submitted_form_items_submitted_form_id_fkey" FOREIGN KEY ("submitted_form_id") REFERENCES "submitted_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachmentToSubmittedFormItems" ADD CONSTRAINT "_AttachmentToSubmittedFormItems_A_fkey" FOREIGN KEY ("A") REFERENCES "attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachmentToSubmittedFormItems" ADD CONSTRAINT "_AttachmentToSubmittedFormItems_B_fkey" FOREIGN KEY ("B") REFERENCES "submitted_form_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
