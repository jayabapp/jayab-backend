-- English and Arabic editions for the footer CMS entries (host call box, About us and the
-- quick-search links). Data only: no schema change. Persian stays in the existing columns,
-- and rows an editor has already translated are left alone.

UPDATE "contents"
SET "translations" = $json${
  "en": {
    "title": "Start earning with your property!",
    "small_text": "If you own a property, now is the time to earn from it. List it on Jayab to reach thousands of travellers and manage your booking calendar with ease. Join the Jayab host community today and enjoy our special features.",
    "seo": {
      "metaTitle": "Start earning with your property on Jayab",
      "metaDescription": "List your stay on Jayab, reach thousands of travellers and manage your booking calendar with ease."
    }
  },
  "ar": {
    "title": "ابدأ تحقيق الدخل من مكان إقامتك!",
    "small_text": "إذا كنت تملك مكان إقامة، فقد حان الوقت لتحقيق دخل منه. اعرض مكان إقامتك على جاياب لآلاف المسافرين وأدِر تقويم حجوزاتك بسهولة. انضم اليوم إلى عائلة مضيفي جاياب واستفد من مزايانا الخاصة.",
    "seo": {
      "metaTitle": "ابدأ تحقيق الدخل من مكان إقامتك مع جاياب",
      "metaDescription": "اعرض مكان إقامتك على جاياب لآلاف المسافرين وأدِر تقويم حجوزاتك بسهولة."
    }
  }
}$json$::jsonb
WHERE "key" = 'footerCallUs' AND "translations" IS NULL;

UPDATE "contents"
SET "translations" = $json${
  "en": {
    "title": "About us",
    "small_text": "Jayab is a specialised, powerful and comprehensive app that makes renting properties and stays online easier, shares property information and serves the needs of owners, advisors and guests.",
    "full_text": "Jayab is a specialised, powerful and comprehensive app that makes renting properties and stays online easier, shares property information and serves the needs of owners, advisors and guests. It started in 1401 (2022) and released the first version of its app in Esfand 1401 (March 2023). On the platform, users can register as an owner, an advisor or a guest and start once our team has approved them.\n\n\n\nJayab is a place to list properties and stays for short-term rental, so guests can deal with hosts directly and without a middleman, or book through advisors if they prefer, with no commission or fee.\n\n\n\nIn the Jayab app you will find rental listings for stays such as villas, suites, apartments, cabins and boutique hotels, posted by the owner or their representative. If a listing is marked Verified, the owner and the stay have been verified and the documents needed for any follow-up are kept by Jayab. If a listing is not verified, Jayab is not responsible once a guest books it.\n\n\n\nAs a host, you can list your stay for free: install the app, register as an owner, then add your property's details and photos. After listing, if you want more visibility, advertising and every Jayab feature, including advisor requests, boosting, daily availability, sending details and photos and appearing in the listings, you can pay for a monthly or three-month subscription.\n\n\n\nAdvisors can register in the advisor section to access listings across Iran, contact verified owners directly, get discounts, see every property's details, photos, prices and location, and earn Jayab's featured advisor status.\n\n\n\nGuests who install Jayab can browse every stay on the platform, choose one and confirm their booking directly with the owner, or through Jayab's featured advisors if they prefer.\n\n\n\nJayab app",
    "html": "<p><strong>About us</strong></p>\n<p style=\"text-align: justify;\">Jayab is a specialised, powerful and comprehensive app that makes renting properties and stays online easier, shares property information and serves the needs of owners, advisors and guests. It started in 1401 (2022) and released the first version of its app in Esfand 1401 (March 2023). On the platform, users can register as an owner, an advisor or a guest and start once our team has approved them.</p>\n<p style=\"text-align: justify;\">&nbsp;</p>\n<p style=\"text-align: justify;\">Jayab is a place to list properties and stays for short-term rental, so guests can deal with hosts directly and without a middleman, or book through advisors if they prefer, with no commission or fee.</p>\n<p style=\"text-align: justify;\">&nbsp;</p>\n<p style=\"text-align: justify;\">In the Jayab app you will find rental listings for stays such as villas, suites, apartments, cabins and boutique hotels, posted by the owner or their representative. If a listing is marked Verified, the owner and the stay have been verified and the documents needed for any follow-up are kept by Jayab. If a listing is not verified, Jayab is not responsible once a guest books it.</p>\n<p style=\"text-align: justify;\">&nbsp;</p>\n<p style=\"text-align: justify;\">As a host, you can list your stay for free: install the app, register as an owner, then add your property's details and photos. After listing, if you want more visibility, advertising and every Jayab feature, including advisor requests, boosting, daily availability, sending details and photos and appearing in the listings, you can pay for a monthly or three-month subscription.</p>\n<p style=\"text-align: justify;\">&nbsp;</p>\n<p style=\"text-align: justify;\">Advisors can register in the advisor section to access listings across Iran, contact verified owners directly, get discounts, see every property's details, photos, prices and location, and earn Jayab's featured advisor status.</p>\n<p style=\"text-align: justify;\">&nbsp;</p>\n<p style=\"text-align: justify;\">Guests who install Jayab can browse every stay on the platform, choose one and confirm their booking directly with the owner, or through Jayab's featured advisors if they prefer.</p>",
    "seo": {
      "metaTitle": "About Jayab",
      "metaDescription": "Jayab is a specialised, powerful and comprehensive app that makes renting properties and stays online easier, shares property information and serves the needs of owners, advisors and guests."
    }
  },
  "ar": {
    "title": "من نحن",
    "small_text": "تطبيق جاياب أداة متخصصة وقوية وشاملة لتسهيل استئجار العقارات وأماكن الإقامة عبر الإنترنت، ونقل معلومات العقار، وتلبية احتياجات الملاك والمستشارين والضيوف.",
    "full_text": "تطبيق جاياب أداة متخصصة وقوية وشاملة لتسهيل استئجار العقارات وأماكن الإقامة عبر الإنترنت، ونقل معلومات العقار، وتلبية احتياجات الملاك والمستشارين والضيوف. بدأ نشاطه عام 1401 هجري شمسي (2022) وأطلق أول إصدار من تطبيقه في إسفند 1401 (مارس 2023). يمكن للمستخدمين التسجيل على المنصة كمالك أو مستشار أو ضيف وبدء نشاطهم بعد موافقة فريقنا.\n\n\n\nجاياب منصة لنشر إعلانات تأجير العقارات وأماكن الإقامة لفترات قصيرة، ليتواصل الضيف مع المضيف مباشرة ودون وسيط، أو يحجز عبر المستشارين إن رغب، دون دفع أي عمولة أو رسوم.\n\n\n\nستجد في تطبيق جاياب إعلانات لتأجير أماكن الإقامة، منها الفلل والأجنحة والشقق والأكواخ والفنادق البوتيك، يسجّلها المالك أو من ينوب عنه. إذا رأيت عبارة «موثّق» بجانب أي عقار، فهذا يعني أن المالك والعقار قد تم التحقق منهما وأن المستندات اللازمة للمتابعة محفوظة لدى جاياب. أما إذا لم يكن العقار موثّقًا، فلا تتحمل جاياب أي مسؤولية بعد حجز الضيف له.\n\n\n\nيمكنك كمضيف نشر مكان إقامتك مجانًا: ثبّت التطبيق، وسجّل في قسم المالك، ثم أضف معلومات عقارك وصوره. وبعد النشر، إن رغبت في ظهور أكبر لإعلانك والاستفادة من جميع مزايا جاياب، ومنها طلبات المستشارين والترقية وإعلان التوفر اليومي وإرسال المعلومات والصور والظهور في قائمة الإعلانات، يمكنك دفع اشتراك شهري أو لثلاثة أشهر.\n\n\n\nويمكن للمستشارين التسجيل من قسم المستشار للوصول إلى جميع الإعلانات في أنحاء إيران، والتواصل المباشر مع الملاك الموثوقين، والحصول على الخصومات، والاطلاع على معلومات العقارات وصورها وأسعارها ومواقعها، ونيل ميزة المستشار المميز في جاياب.\n\n\n\nوبعد تثبيت جاياب، يستطيع الضيف تصفح جميع أماكن الإقامة المتاحة واختيار ما يناسبه، ثم تأكيد حجزه مباشرة مع المالك أو عبر مستشاري جاياب المميزين إن رغب.\n\n\n\nتطبيق جاياب",
    "html": "<p><strong>من نحن</strong></p>\n<p style=\"text-align: justify;\">تطبيق جاياب أداة متخصصة وقوية وشاملة لتسهيل استئجار العقارات وأماكن الإقامة عبر الإنترنت، ونقل معلومات العقار، وتلبية احتياجات الملاك والمستشارين والضيوف. بدأ نشاطه عام 1401 هجري شمسي (2022) وأطلق أول إصدار من تطبيقه في إسفند 1401 (مارس 2023). يمكن للمستخدمين التسجيل على المنصة كمالك أو مستشار أو ضيف وبدء نشاطهم بعد موافقة فريقنا.</p>\n<p style=\"text-align: justify;\">&nbsp;</p>\n<p style=\"text-align: justify;\">جاياب منصة لنشر إعلانات تأجير العقارات وأماكن الإقامة لفترات قصيرة، ليتواصل الضيف مع المضيف مباشرة ودون وسيط، أو يحجز عبر المستشارين إن رغب، دون دفع أي عمولة أو رسوم.</p>\n<p style=\"text-align: justify;\">&nbsp;</p>\n<p style=\"text-align: justify;\">ستجد في تطبيق جاياب إعلانات لتأجير أماكن الإقامة، منها الفلل والأجنحة والشقق والأكواخ والفنادق البوتيك، يسجّلها المالك أو من ينوب عنه. إذا رأيت عبارة «موثّق» بجانب أي عقار، فهذا يعني أن المالك والعقار قد تم التحقق منهما وأن المستندات اللازمة للمتابعة محفوظة لدى جاياب. أما إذا لم يكن العقار موثّقًا، فلا تتحمل جاياب أي مسؤولية بعد حجز الضيف له.</p>\n<p style=\"text-align: justify;\">&nbsp;</p>\n<p style=\"text-align: justify;\">يمكنك كمضيف نشر مكان إقامتك مجانًا: ثبّت التطبيق، وسجّل في قسم المالك، ثم أضف معلومات عقارك وصوره. وبعد النشر، إن رغبت في ظهور أكبر لإعلانك والاستفادة من جميع مزايا جاياب، ومنها طلبات المستشارين والترقية وإعلان التوفر اليومي وإرسال المعلومات والصور والظهور في قائمة الإعلانات، يمكنك دفع اشتراك شهري أو لثلاثة أشهر.</p>\n<p style=\"text-align: justify;\">&nbsp;</p>\n<p style=\"text-align: justify;\">ويمكن للمستشارين التسجيل من قسم المستشار للوصول إلى جميع الإعلانات في أنحاء إيران، والتواصل المباشر مع الملاك الموثوقين، والحصول على الخصومات، والاطلاع على معلومات العقارات وصورها وأسعارها ومواقعها، ونيل ميزة المستشار المميز في جاياب.</p>\n<p style=\"text-align: justify;\">&nbsp;</p>\n<p style=\"text-align: justify;\">وبعد تثبيت جاياب، يستطيع الضيف تصفح جميع أماكن الإقامة المتاحة واختيار ما يناسبه، ثم تأكيد حجزه مباشرة مع المالك أو عبر مستشاري جاياب المميزين إن رغب.</p>",
    "seo": {
      "metaTitle": "عن جاياب",
      "metaDescription": "تطبيق جاياب أداة متخصصة وقوية وشاملة لتسهيل استئجار العقارات وأماكن الإقامة عبر الإنترنت، ونقل معلومات العقار، وتلبية احتياجات الملاك والمستشارين والضيوف."
    }
  }
}$json$::jsonb
WHERE "key" = 'aboutUs' AND "translations" IS NULL;

-- Links are matched by their Persian title inside the footer quick-search category, so
-- environments whose links differ only get the titles they share.
UPDATE "contents" AS c
SET "translations" = t."translations"
FROM "content_categories" AS cc,
(VALUES
  ('اجاره ویلا استخردار کردان', $json${
  "en": {
    "title": "Villa with a pool for rent in Kordan"
  },
  "ar": {
    "title": "إيجار فيلا مع مسبح في كردان"
  }
}$json$::jsonb),
  ('اجاره ویلا در کردان', $json${
  "en": {
    "title": "Villa rental in Kordan"
  },
  "ar": {
    "title": "إيجار فيلا في كردان"
  }
}$json$::jsonb),
  ('اجاره ویلا', $json${
  "en": {
    "title": "Villa rental"
  },
  "ar": {
    "title": "إيجار فيلا"
  }
}$json$::jsonb),
  ('اجاره ویلا برای جشن', $json${
  "en": {
    "title": "Villa rental for celebrations"
  },
  "ar": {
    "title": "إيجار فيلا للاحتفالات"
  }
}$json$::jsonb),
  ('اجاره ویلا برای مهمانی', $json${
  "en": {
    "title": "Villa rental for parties"
  },
  "ar": {
    "title": "إيجار فيلا للحفلات"
  }
}$json$::jsonb),
  ('اجاره ویلا برای تولد', $json${
  "en": {
    "title": "Villa rental for birthdays"
  },
  "ar": {
    "title": "إيجار فيلا لأعياد الميلاد"
  }
}$json$::jsonb),
  ('اجاره ویلا جنگلی در شمال', $json${
  "en": {
    "title": "Forest villa rental in northern Iran"
  },
  "ar": {
    "title": "إيجار فيلا في الغابة شمال إيران"
  }
}$json$::jsonb),
  ('اجاره ویلا ییلاقی', $json${
  "en": {
    "title": "Countryside villa rental"
  },
  "ar": {
    "title": "إيجار فيلا ريفية"
  }
}$json$::jsonb),
  ('اجاره ویلا کوهستانی', $json${
  "en": {
    "title": "Mountain villa rental"
  },
  "ar": {
    "title": "إيجار فيلا جبلية"
  }
}$json$::jsonb),
  ('اجاره ویلا با پت', $json${
  "en": {
    "title": "Villa rental with pets"
  },
  "ar": {
    "title": "إيجار فيلا مع الحيوانات الأليفة"
  }
}$json$::jsonb),
  ('اجاره ویلا با حیوان خانگی', $json${
  "en": {
    "title": "Pet-friendly villa rental"
  },
  "ar": {
    "title": "إيجار فيلا تقبل الحيوانات الأليفة"
  }
}$json$::jsonb),
  ('اجاره ویلا کنار دریا', $json${
  "en": {
    "title": "Seaside villa rental"
  },
  "ar": {
    "title": "إيجار فيلا بجانب البحر"
  }
}$json$::jsonb),
  ('اجاره ویلا لب دریا', $json${
  "en": {
    "title": "Beachfront villa rental"
  },
  "ar": {
    "title": "إيجار فيلا على شاطئ البحر"
  }
}$json$::jsonb),
  ('اجاره ویلا ساحلی', $json${
  "en": {
    "title": "Coastal villa rental"
  },
  "ar": {
    "title": "إيجار فيلا ساحلية"
  }
}$json$::jsonb),
  ('اجاره ویلا استخردار', $json${
  "en": {
    "title": "Villa with a pool for rent"
  },
  "ar": {
    "title": "إيجار فيلا مع مسبح"
  }
}$json$::jsonb),
  ('اجاره کلبه چوبی', $json${
  "en": {
    "title": "Wooden cabin rental"
  },
  "ar": {
    "title": "إيجار كوخ خشبي"
  }
}$json$::jsonb),
  ('اجاره ویلا در رشت', $json${
  "en": {
    "title": "Villa rental in Rasht"
  },
  "ar": {
    "title": "إيجار فيلا في رشت"
  }
}$json$::jsonb),
  ('اجاره کلبه سوئیسی', $json${
  "en": {
    "title": "Swiss-style cabin rental"
  },
  "ar": {
    "title": "إيجار كوخ على الطراز السويسري"
  }
}$json$::jsonb)
) AS t("title", "translations")
WHERE c."category_id" = cc."id"
  AND cc."key" = 'footer-quick-search-links'
  AND btrim(c."title") = t."title"
  AND c."translations" IS NULL;
