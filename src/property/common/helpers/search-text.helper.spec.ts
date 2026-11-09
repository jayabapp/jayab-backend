import {
  normalizePersianSearchText,
  persianSearchVariants,
  SEARCH_QUERY_MAX_WORDS,
  isExactPropertyCode,
  persianTitleKey,
  tokenizeSearchText,
  translatedTitleKey,
} from './search-text.helper';

describe('search text helpers', () => {
  it('normalizes Arabic/Persian letters, digits and spacing', () => {
    expect(normalizePersianSearchText('كيش  ۱٢‌۳')).toBe('کیش 123');
  });

  it('limits words and removes punctuation', () => {
    const words = tokenizeSearchText('aa, bb cc dd ee ff gg hh ii jj');
    expect(words).toHaveLength(SEARCH_QUERY_MAX_WORDS);
    expect(words[0]).toBe('aa');
  });

  it('builds a backward-compatible Arabic character variant', () => {
    expect(persianSearchVariants('کیش')).toContain('كيش');
  });

  it('builds place-name comparison keys that ignore letter forms, joiners, spacing and case', () => {
    const zwnj = String.fromCharCode(0x200c);
    expect(persianTitleKey(` اسلام${zwnj}شهر  `)).toBe('اسلامشهر');
    expect(persianTitleKey('كرج')).toBe(persianTitleKey('کرج'));
    expect(translatedTitleKey(' RAMSAR ')).toBe('ramsar');
    expect(translatedTitleKey('أصفهان')).toBe(translatedTitleKey('اصفهان'));
  });

  it('recognizes property codes written with Persian digits', () => {
    expect(isExactPropertyCode('۱۲۳۴۵')).toBe(true);
    expect(isExactPropertyCode('۱۲۳ ویلا')).toBe(false);
  });
});
