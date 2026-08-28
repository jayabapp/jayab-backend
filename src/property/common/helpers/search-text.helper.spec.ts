import {
  normalizePersianSearchText,
  persianSearchVariants,
  SEARCH_QUERY_MAX_WORDS,
  isExactPropertyCode,
  tokenizeSearchText,
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

  it('recognizes property codes written with Persian digits', () => {
    expect(isExactPropertyCode('۱۲۳۴۵')).toBe(true);
    expect(isExactPropertyCode('۱۲۳ ویلا')).toBe(false);
  });
});
