/**
 * using: https://www.npmjs.com/package/persian-rex
 */

const charRange = [
  '[\u06A9\u06AF\u06C0\u06CC\u060C',
  '\u062A\u062B\u062C\u062D\u062E\u062F',
  '\u063A\u064A\u064B\u064C\u064D\u064E',
  '\u064F\u067E\u0670\u0686\u0698\u200C',
  '\u0621-\u0629\u0630-\u0639\u0641-\u0654]',
].join('');

/**
 * بررسی عدم وجود کاراکترهای غیر فارسی
 * @param text
 * @returns
 */
export function isFullPersianLetter(text: string) {
  const reg = new RegExp('^' + charRange + '+$');
  return reg.test(text.replace(/ /g, ''));
}

export function hasPersianLetter(text: string) {
  const reg = new RegExp(charRange);
  return reg.test(text.replace(/ /g, ''));
}
