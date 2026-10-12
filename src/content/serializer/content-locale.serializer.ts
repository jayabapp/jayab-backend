import { Content, Prisma } from '@prisma/client';
import { ContentLocale } from '../dto/content-locale.dto';

const asObject = (value: Prisma.JsonValue): Prisma.JsonObject =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export type LocalizedContent<T extends Content> = Omit<T, 'translations'> & { content_locale: ContentLocale };

export const localizeContent = <T extends Content>(
  item: T,
  locale: ContentLocale = 'fa',
): LocalizedContent<T> => {
  const { translations, ...base } = item;
  const edition = asObject(asObject(translations)[locale]);
  const seo = asObject(edition.seo);
  const isComplete =
    locale !== 'fa' &&
    ['title', 'small_text', 'full_text'].every(
      (field) => typeof edition[field] === 'string' && (edition[field] as string).trim(),
    ) &&
    typeof edition.html === 'string' &&
    ['metaTitle', 'metaDescription'].every(
      (field) => typeof seo[field] === 'string' && (seo[field] as string).trim(),
    );

  if (!isComplete) return { ...base, content_locale: 'fa' };

  return {
    ...base,
    title: edition.title as string,
    small_text: edition.small_text as string,
    full_text: edition.full_text as string,
    html: edition.html as string,
    // Canonical and sitemap settings belong to the page, not to a translation.
    seo: { ...asObject(item.seo), metaTitle: seo.metaTitle, metaDescription: seo.metaDescription },
    content_locale: locale,
  };
};
