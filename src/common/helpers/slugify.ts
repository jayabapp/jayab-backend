export const slugify = (titleStr: string): string => {
  return (
    titleStr
      .trim()
      // First convert Arabic and English numbers to Persian numbers
      .replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])
      .replace(/[١٢٣٤٥٦٧٨٩٠]/g, (d) => {
        const arabicToPersian: Record<string, string> = {
          '٠': '۰',
          '١': '۱',
          '٢': '۲',
          '٣': '۳',
          '٤': '۴',
          '٥': '۵',
          '٦': '۶',
          '٧': '۷',
          '٨': '۸',
          '٩': '۹',
        };
        return arabicToPersian[d];
      })
      .toLowerCase()
      // FIRST handle special characters (like slashes) and replace with dash
      .replace(/[\/,!@#$%^&*()+=~`.?:;\\]/g, '-')
      // THEN remove any remaining invalid characters (but keep Persian chars and numbers)
      .replace(/[^a-z\s_-ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهويةىپچژکگی۰۱۲۳۴۵۶۷۸۹-]/g, '')
      // Replace whitespace with dash
      .replace(/\s+/g, '-')
      // Collapse multiple dashes
      .replace(/-+/g, '-')
      // Remove leading/trailing dashes
      .replace(/^-+|-+$/g, '')
  );
};

/**
 * Sanitizes a text string according to specified rules
 * @param text - Input text string (sentence)
 * @returns Array of sanitized words
 */
export const sanitizeText = (text: string): string[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Step 1: Convert Arabic characters to Persian
  const arabicToPersianMap: { [key: string]: string } = {
    ك: 'ک',
    ي: 'ی',
    ة: 'ه',
    ء: 'ء',
    ؤ: 'ؤ',
    ئ: 'ئ',
    إ: 'ا',
    أ: 'ا',
    آ: 'آ',
    ٱ: 'ا',
    ى: 'ی',
  };

  let sanitized = text.replace(/[كيئةإأٱى]/g, (match) => {
    return arabicToPersianMap[match] || match;
  });

  // Step 2: Convert Arabic numbers to Persian numbers
  const arabicToPersianNumbers: { [key: string]: string } = {
    '٠': '۰',
    '١': '۱',
    '٢': '۲',
    '٣': '۳',
    '٤': '۴',
    '٥': '۵',
    '٦': '۶',
    '٧': '۷',
    '٨': '۸',
    '٩': '۹',
  };

  sanitized = sanitized.replace(/[٠-٩]/g, (match) => {
    return arabicToPersianNumbers[match] || match;
  });

  // Step 3: Convert all numbers (Persian, Arabic, English) to English numbers
  const persianToEnglishNumbers: { [key: string]: string } = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
  };

  sanitized = sanitized.replace(/[۰-۹]/g, (match) => {
    return persianToEnglishNumbers[match] || match;
  });

  // Step 4: Remove all numbers (English numbers now)
  sanitized = sanitized.replace(/[0-9]/g, '');

  // Step 5: Remove all special characters, keep only Persian chars
  // Persian Unicode range: \u0600-\u06FF, \uFB50-\uFDFF, \uFE70-\uFEFF
  // Also keep space (and optionally newline) for word separation
  sanitized = sanitized.replace(/[^\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF\s]/g, '');

  // Step 6: Split into words, remove empty strings
  const words = sanitized
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  return words;
};
