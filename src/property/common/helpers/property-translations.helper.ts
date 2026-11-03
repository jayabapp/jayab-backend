import { Prisma, PropertyDescription } from '@prisma/client';
import { Locale } from 'src/common/dto/locale.dto';

export const DESCRIPTION_FIELDS = [
  'property_dscr',
  'ad_dscr',
  'facility_dscr',
  'pattern_dscr',
  'distance_dscr',
  'guest_dscr',
  'pet_dscr',
  'party_dscr',
  'doc_dscr',
  'other_dscr',
] as const;

export type DescriptionField = (typeof DESCRIPTION_FIELDS)[number];

export type DescriptionLocales = Partial<Record<DescriptionField, Locale>>;

const editionOf = (translations: Prisma.JsonValue | undefined, locale: Locale) => {
  const edition = translations && typeof translations === 'object' ? translations[locale] : undefined;
  return edition && typeof edition === 'object' ? edition : undefined;
};

const filled = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

/** Per-field fallback: a field without an edition keeps the Persian text and says so in `locales`. */
export function localizeDescriptions(
  description: PropertyDescription | null | undefined,
  locale: Locale = 'fa',
): { value: Omit<PropertyDescription, 'translations'> | null; locales: DescriptionLocales } {
  if (!description) return { value: null, locales: {} };
  const { translations, ...value } = description;
  const edition = locale === 'fa' ? undefined : editionOf(translations, locale);
  const locales: DescriptionLocales = {};
  for (const field of DESCRIPTION_FIELDS) {
    if (!value[field]) continue;
    const text = edition?.[field];
    if (filled(text)) {
      value[field] = text.trim();
      locales[field] = locale;
    } else locales[field] = 'fa';
  }
  return { value, locales };
}

export function localizeHostName(
  name: string | null | undefined,
  translations: Prisma.JsonValue | undefined,
  locale: Locale = 'fa',
): { value: string | null | undefined; locale: Locale } {
  const text = locale === 'fa' ? undefined : editionOf(translations, locale)?.name;
  return filled(text) ? { value: text.trim(), locale } : { value: name, locale: 'fa' };
}

/** Drops blank strings and empty editions so the stored JSON only holds real translations. */
export function cleanEditions(
  editions: { en?: object; ar?: object } | undefined,
  fields: readonly string[],
): Prisma.InputJsonObject | null {
  const result: Record<string, Record<string, string>> = {};
  for (const locale of ['en', 'ar'] as const) {
    const edition: Record<string, string> = {};
    for (const field of fields) {
      const text = (editions?.[locale] as Record<string, unknown> | undefined)?.[field];
      if (filled(text)) edition[field] = text.trim();
    }
    if (Object.keys(edition).length) result[locale] = edition;
  }
  return Object.keys(result).length ? result : null;
}
