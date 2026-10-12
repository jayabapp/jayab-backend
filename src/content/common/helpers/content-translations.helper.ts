/** Empty editor markup is not a translated legal document. */
export const hasTermsBody = (html: unknown): boolean =>
  typeof html === 'string' &&
  !!html
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:nbsp|#160|#xA0);/gi, ' ')
    .trim();
