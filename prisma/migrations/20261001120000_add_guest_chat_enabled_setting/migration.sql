-- کلید سراسری توقف چت مهمان–میزبان (حالت Incident). 1 = فعال، 0 = متوقف
-- اگر ردیف وجود نداشته باشد بک‌اند چت را فعال فرض می‌کند، پس ترتیب دیپلوی مهم نیست.
INSERT INTO "settings" ("title", "key", "value", "min", "max", "data_type", "sort_order", "updated_at")
VALUES ('چت مهمان و میزبان (1 = فعال، 0 = متوقف)', 'GUEST_CHAT_ENABLED', '0', 0, 1, 'BOOLEAN', 100, NOW())
ON CONFLICT ("key") DO NOTHING;
