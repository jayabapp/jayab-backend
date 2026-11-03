ALTER TABLE "cities" ADD COLUMN "translations" JSONB;
ALTER TABLE "properties" ADD COLUMN "translations" JSONB;

-- Known province/place names. Canonical Persian names and all location IDs stay intact.
WITH defaults(title, en, ar) AS (
  VALUES
    ('آذربایجان شرقی', 'East Azerbaijan', 'أذربيجان الشرقية'),
    ('آذربایجان غربی', 'West Azerbaijan', 'أذربيجان الغربية'),
    ('اردبیل', 'Ardabil', 'أردبيل'),
    ('اصفهان', 'Isfahan', 'أصفهان'),
    ('البرز', 'Alborz', 'ألبرز'),
    ('ایلام', 'Ilam', 'إيلام'),
    ('بوشهر', 'Bushehr', 'بوشهر'),
    ('تهران', 'Tehran', 'طهران'),
    ('چهارمحال و بختیاری', 'Chaharmahal and Bakhtiari', 'جهارمحال وبختياري'),
    ('خراسان جنوبی', 'South Khorasan', 'خراسان الجنوبية'),
    ('خراسان رضوی', 'Razavi Khorasan', 'خراسان الرضوية'),
    ('خراسان شمالی', 'North Khorasan', 'خراسان الشمالية'),
    ('خوزستان', 'Khuzestan', 'خوزستان'),
    ('زنجان', 'Zanjan', 'زنجان'),
    ('سمنان', 'Semnan', 'سمنان'),
    ('سیستان و بلوچستان', 'Sistan and Baluchestan', 'سيستان وبلوشستان'),
    ('فارس', 'Fars', 'فارس'),
    ('قزوین', 'Qazvin', 'قزوين'),
    ('قم', 'Qom', 'قم'),
    ('کردستان', 'Kurdistan', 'كردستان'),
    ('کرمان', 'Kerman', 'كرمان'),
    ('کرمانشاه', 'Kermanshah', 'كرمانشاه'),
    ('کهگیلویه و بویراحمد', 'Kohgiluyeh and Boyer-Ahmad', 'كهكيلويه وبوير أحمد'),
    ('گلستان', 'Golestan', 'كلستان'),
    ('لرستان', 'Lorestan', 'لرستان'),
    ('گیلان', 'Gilan', 'كيلان'),
    ('مازندران', 'Mazandaran', 'مازندران'),
    ('مرکزی', 'Markazi', 'مركزي'),
    ('هرمزگان', 'Hormozgan', 'هرمزغان'),
    ('همدان', 'Hamadan', 'همدان'),
    ('یزد', 'Yazd', 'يزد'),
    ('چهارباغ', 'Chaharbagh', 'جهارباغ'),
    ('آبسرد', 'Absard', 'آبسرد'),
    ('سلمانشهر', 'Salman Shahr', 'سلمان شهر'),
    ('رودبار', 'Rudbar', 'رودبار'),
    ('شفت', 'Shaft', 'شفت'),
    ('یاسوج', 'Yasuj', 'ياسوج'),
    ('پونک', 'Punak', 'بونك'),
    ('توس فردوسی', 'Tus Ferdowsi', 'طوس فردوسي'),
    ('بهجت آباد', 'Behjat Abad', 'بهجت آباد')
)
UPDATE "cities" AS target
SET "translations" = jsonb_build_object('en', jsonb_build_object('title', defaults.en),
                                        'ar', jsonb_build_object('title', defaults.ar))
                     || COALESCE(target."translations", '{}'::jsonb)
FROM defaults WHERE btrim(target."title") = defaults.title;

-- Reuse the reviewed popular-city editions from the preceding migration.
WITH defaults AS (
  SELECT DISTINCT ON (btrim("title")) btrim("title") AS title,
    jsonb_strip_nulls(jsonb_build_object(
      'en', CASE WHEN "translations"->'en'->>'title' IS NOT NULL THEN jsonb_build_object('title', "translations"->'en'->>'title') END,
      'ar', CASE WHEN "translations"->'ar'->>'title' IS NOT NULL THEN jsonb_build_object('title', "translations"->'ar'->>'title') END
    )) AS editions
  FROM "landing_pages"
  WHERE "position" = 'popular_city' AND "is_active" = true AND "show_in_home" = true
    AND "translations" IS NOT NULL
  ORDER BY btrim("title"), "sort_order" ASC NULLS LAST, "id"
)
UPDATE "cities" AS target
SET "translations" = defaults.editions || COALESCE(target."translations", '{}'::jsonb)
FROM defaults WHERE btrim(target."title") = defaults.title;

-- Reviewed public home titles on 2026-10-12. Never infer translations for other host-authored text.
-- ID, code and original text must all match; administrator editions take precedence.
WITH defaults(id, code, original_title, en, ar) AS (
  VALUES
    (11327, '60516', 'ویلا دو نبش', 'Corner villa', 'فيلا على ناصيتين'),
    (11329, '94668', 'آپارتمان مبله در پونک', 'Furnished apartment in Punak', 'شقة مفروشة في بونك'),
    (11328, '53880', 'ویلا استخردار با جکوزی', 'Villa with a pool and jacuzzi', 'فيلا مع مسبح وجاكوزي'),
    (11021, '11700', 'ویلا فلت شهرکی دوخواب در سلمانشهر متل قو', 'Two-bedroom single-storey villa in a residential complex, Salman Shahr (Motel Qu)', 'فيلا من طابق واحد بغرفتي نوم في مجمع سكني، سلمان شهر (متل قو)'),
    (3606, '11214', 'ویلا استخر دار سرپوشیده در بابلسر با تمامی امکانات', 'Fully equipped villa with an indoor pool in Babolsar', 'فيلا مجهزة بالكامل مع مسبح داخلي في بابلسر'),
    (5780, '30910', 'باغ ویلا کلبه دربست  مشهد اول شاهنامه 181', 'Private garden villa cabin in Mashhad, Shahnameh 181', 'كوخ بحديقة خاصة في مشهد، شاهنامه 181'),
    (11317, '91955', 'اقامتگاه باتمام امکانات نزدیک دریاچه عروس', 'Fully equipped stay near Arous Lake', 'إقامة مجهزة بالكامل قرب بحيرة عروس'),
    (11315, '28307', 'هتل آراد تهران ', 'Arad Hotel, Tehran', 'فندق آراد، طهران'),
    (5259, '45063', 'ویلا حیاط دار فلت در شهر بابلسر ', 'Single-storey villa with a courtyard in Babolsar', 'فيلا من طابق واحد بفناء في بابلسر'),
    (11313, '68693', 'اجاره ویلا شالما در شفت روستای شالما', 'Shalma villa in Shalma village, Shaft', 'فيلا شالما في قرية شالما، شفت'),
    (11311, '57051', 'ویلا دوخوابه چوبی تراس دار در ماسال', 'Two-bedroom wooden villa with a terrace in Masal', 'فيلا خشبية بغرفتي نوم وشرفة في ماسال'),
    (11305, '24404', 'یک واحد سوئیت طبقه دوم مرکز شهر یاسوج', 'Second-floor suite in central Yasuj', 'جناح في الطابق الثاني بوسط ياسوج')
)
UPDATE "properties" AS target
SET "translations" = jsonb_build_object('en', jsonb_build_object('title', defaults.en),
                                        'ar', jsonb_build_object('title', defaults.ar))
                     || COALESCE(target."translations", '{}'::jsonb)
FROM defaults
WHERE target."id" = defaults.id AND target."code" = defaults.code
  AND btrim(target."title") = btrim(defaults.original_title);
