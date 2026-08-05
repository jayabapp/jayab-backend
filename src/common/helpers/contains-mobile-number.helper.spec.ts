import { containsMobileNumber } from './contains-mobile-number.helper';

describe('containsMobileNumber', () => {
  it.each([
    '09123456789',
    '9123456789',
    '+989123456789',
    '989123456789',
    '00989123456789',
    '۰۹۱۲۳۴۵۶۷۸۹',
    '٠٩١٢٣٤٥٦٧٨٩',
    '０９１２３４５６７８９',
    'شماره من 0912 345 6789 است',
    '۰۹۱۲-۳۴۵-۶۷۸۹',
    '+98 (912) 345-6789',
    '0​9​1​2​3​4​5​6​7​8​9',
    '0a9b1c2d3e4f5g6h7i8j9',
    '0mobile9mobile1mobile2mobile3mobile4mobile5mobile6mobile7mobile8mobile9',
  ])('should detect an Iranian mobile number in %s', (text) => {
    expect(containsMobileNumber(text)).toBe(true);
  });

  it.each([
    '',
    'پیام بدون شماره موبایل',
    '02112345678',
    '1234567890',
    '6037997512345678',
    'امتیاز 9 از 10 است',
    '1091234567890',
    '091234567890',
  ])('should not detect a mobile number in %s', (text) => {
    expect(containsMobileNumber(text)).toBe(false);
  });
});
