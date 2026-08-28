export const SEARCH_QUERY_MIN_LENGTH = 2;
export const SEARCH_QUERY_MAX_LENGTH = 80;
export const SEARCH_QUERY_MAX_WORDS = 8;

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export const normalizePersianSearchText = (value: string): string =>
  String(value ?? '')
    .normalize('NFKC')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[‌‍‎‏]/g, ' ')
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/\s+/g, ' ')
    .trim();

export const tokenizeSearchText = (value: string): string[] =>
  normalizePersianSearchText(value)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= SEARCH_QUERY_MIN_LENGTH)
    .slice(0, SEARCH_QUERY_MAX_WORDS);

export const isExactPropertyCode = (value: string): boolean =>
  /^\d+$/.test(normalizePersianSearchText(value));

export const persianSearchVariants = (value: string): string[] => {
  const normalized = normalizePersianSearchText(value);
  return [...new Set([normalized, normalized.replace(/ی/g, 'ي').replace(/ک/g, 'ك')])];
};
