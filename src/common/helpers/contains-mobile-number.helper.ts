const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const GAP = '[^0-9]{0,10}';
const PREFIX = `(?:0${GAP}0${GAP}9${GAP}8${GAP}|\\+${GAP}9${GAP}8${GAP}|9${GAP}8${GAP}|0${GAP})?`;
const SUBSCRIBER_NUMBER = `9(?:${GAP}[0-9]){9}`;
const MOBILE_PATTERN = new RegExp(`(^|[^0-9])${PREFIX}${SUBSCRIBER_NUMBER}(?![0-9])`);

function normalizeDigits(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[۰-۹]/g, (digit) => PERSIAN_DIGITS.indexOf(digit).toString())
    .replace(/[٠-٩]/g, (digit) => ARABIC_DIGITS.indexOf(digit).toString());
}

/**
 * Detects Iranian mobile numbers, including commonly obfuscated forms.
 *
 * Supported prefixes are 09, 9, 98, +98 and 0098. Up to ten non-digit
 * characters may appear between digits to cover spaces, punctuation,
 * zero-width characters and short letter-based obfuscations.
 */
export function containsMobileNumber(text: string): boolean {
  const normalizedText = normalizeDigits(text);

  return MOBILE_PATTERN.test(normalizedText);
}
