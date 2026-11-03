-- Persian remains canonical. Initial editions match the public home data reviewed on 2026-10-12.
ALTER TABLE "property_options" ADD COLUMN "translations" JSONB;
ALTER TABLE "landing_pages" ADD COLUMN "translations" JSONB;

WITH defaults(id, original_title, en, ar) AS (
  VALUES
    (7, 'ویلا', 'Villa', 'فيلا'),
    (9, 'آپارتمان', 'Apartment', 'شقة'),
    (8, 'سوئیت', 'Suite', 'جناح'),
    (102, 'کلبه', 'Cabin', 'كوخ'),
    (103, 'بوتیک هتل', 'Boutique hotel', 'فندق بوتيك'),
    (106, 'بومگردی', 'Eco lodge', 'نُزل بيئي'),
    (27, 'حیاط دار', 'House with a courtyard', 'منزل بفناء'),
    (108, 'باغ تالار', 'Event garden', 'حديقة للمناسبات')
)
UPDATE "property_options" AS target
SET "translations" = jsonb_build_object('en', jsonb_build_object('title', defaults.en),
                                        'ar', jsonb_build_object('title', defaults.ar))
                     || COALESCE(target."translations", '{}'::jsonb)
FROM defaults
WHERE target."id" = defaults.id AND target."title" = defaults.original_title
  AND target."group" = 'PROPERTY_TYPE';

WITH defaults(url, original_title, en, ar) AS (
  VALUES
    ('ramsar', 'رامسر', 'Ramsar', 'رامسر'),
    ('alborz', 'البرز', 'Alborz', 'ألبرز'),
    ('masal', 'ماسال', 'Masal', 'ماسال'),
    ('bandaranzali', 'بندر انزلی', 'Bandar Anzali', 'بندر أنزلي'),
    ('tehran', 'تهران', 'Tehran', 'طهران'),
    ('rasht', 'رشت', 'Rasht', 'رشت'),
    ('isfahan', 'اصفهان', 'Isfahan', 'أصفهان'),
    ('shahriar', 'شهریار', 'Shahriar', 'شهريار'),
    ('lahijan', 'لاهیجان', 'Lahijan', 'لاهيجان'),
    ('nowshahr', 'نوشهر', 'Nowshahr', 'نوشهر'),
    ('chalus', 'چالوس', 'Chalus', 'تشالوس'),
    ('yazd', 'یزد', 'Yazd', 'يزد'),
    ('shiraz', 'شیراز', 'Shiraz', 'شيراز'),
    ('bushehr', 'بوشهر', 'Bushehr', 'بوشهر'),
    ('klardasht', 'کلاردشت', 'Kelardasht', 'كلاردشت'),
    ('qeshm', 'قشم', 'Qeshm', 'قشم'),
    ('fuman', 'فومن', 'Fuman', 'فومن'),
    ('talesh', 'تالش', 'Talesh', 'طالش'),
    ('babolsar', 'بابلسر', 'Babolsar', 'بابلسر'),
    ('tonekabon', 'تنکابن', 'Tonekabon', 'تنكابن'),
    ('mashhad', 'مشهد', 'Mashhad', 'مشهد'),
    ('Gorgan', 'گرگان', 'Gorgan', 'جرجان'),
    ('kashan', 'کاشان', 'Kashan', 'كاشان'),
    ('astara', 'آستارا', 'Astara', 'آستارا'),
    ('sarein', 'سرعین', 'Sarein', 'سرعين'),
    ('kordan', 'کردان', 'Kordan', 'كردان'),
    ('kishisland', 'کیش', 'Kish', 'كيش'),
    ('hamadan', 'همدان', 'Hamadan', 'همدان'),
    ('pool', 'استخردار', 'With a pool', 'مع مسبح'),
    ('coastal', 'ساحلی', 'Coastal stays', 'إقامات ساحلية'),
    ('forest', 'جنگلی', 'Forest stays', 'إقامات في الغابة'),
    ('feast', 'مهمانی', 'Party-friendly stays', 'إقامات مناسبة للحفلات'),
    ('cottage', 'کلبه', 'Cabins', 'أكواخ'),
    ('ecotourism', 'بومگردی', 'Eco lodges', 'نُزل بيئية'),
    ('animal-lover', 'مناسب پت', 'Pet-friendly stays', 'إقامات تسمح بالحيوانات الأليفة'),
    ('summer-house', 'ییلاقی', 'Highland stays', 'إقامات في المرتفعات')
)
UPDATE "landing_pages" AS target
SET "translations" = jsonb_build_object('en', jsonb_build_object('title', defaults.en),
                                        'ar', jsonb_build_object('title', defaults.ar))
                     || COALESCE(target."translations", '{}'::jsonb)
FROM defaults
WHERE target."url" = defaults.url AND target."title" = defaults.original_title;
