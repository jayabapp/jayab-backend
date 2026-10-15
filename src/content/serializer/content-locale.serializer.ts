import { Prisma } from '@prisma/client';
import { ContentLocale } from '../dto/content-locale.dto';
import { hasTermsBody, isFilledText } from '../common/helpers/content-translations.helper';

const asObject = (value: Prisma.JsonValue | undefined): Prisma.JsonObject =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

/** The fields a content row may carry; list summaries select only some of them. */
type LocalizableContent = {
  key?: string | null;
  title: string;
  small_text?: string | null;
  full_text?: string | null;
  html?: string | null;
  seo?: Prisma.JsonValue;
  translations?: Prisma.JsonValue;
};

export type LocalizedContent<T extends LocalizableContent> = Omit<T, 'translations'> & {
  content_locale: ContentLocale;
};

const TEXT_FIELDS = ['small_text', 'full_text'] as const;

/**
 * An edition is published only when it translates every part the Persian original uses,
 * so a page never mixes languages. Short CMS entries (footer copy, link titles) therefore
 * need only their title and text, while pages also need their body and SEO.
 */
export const localizeContent = <T extends LocalizableContent>(
  item: T,
  locale: ContentLocale = 'fa',
): LocalizedContent<T> => {
  const { translations, ...base } = item;
  const edition = asObject(asObject(translations)[locale]);
  const seo = asObject(edition.seo);
  const baseSeo = asObject(item.seo);
  const hasOwnSeo = isFilledText(baseSeo.metaTitle) || isFilledText(baseSeo.metaDescription);

  const isComplete =
    locale !== 'fa' &&
    isFilledText(edition.title) &&
    TEXT_FIELDS.every((field) => !isFilledText(item[field]) || isFilledText(edition[field])) &&
    (!isFilledText(item.html) || typeof edition.html === 'string') &&
    (item.key !== 'terms' || hasTermsBody(edition.html)) &&
    (!hasOwnSeo || (isFilledText(seo.metaTitle) && isFilledText(seo.metaDescription)));

  if (!isComplete) return { ...base, content_locale: 'fa' };

  const texts = Object.fromEntries(
    TEXT_FIELDS.filter((field) => isFilledText(edition[field])).map((field) => [field, edition[field]]),
  );

  return {
    ...base,
    ...texts,
    title: edition.title as string,
    ...(typeof edition.html === 'string' ? { html: edition.html } : {}),
    ...(isFilledText(seo.metaTitle) && isFilledText(seo.metaDescription)
      ? { seo: { ...baseSeo, metaTitle: seo.metaTitle, metaDescription: seo.metaDescription } }
      : {}),
    content_locale: locale,
  };
};
