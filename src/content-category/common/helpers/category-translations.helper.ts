import { TextTranslationsDto } from 'src/common/dto/text-translations.dto';
import { localizeTextFields } from 'src/common/helpers/title-translations.helper';
import { cleanEditions } from 'src/property/common/helpers/property-translations.helper';
import { Prisma } from '@prisma/client';
import { Locale } from 'src/common/dto/locale.dto';

export const CATEGORY_TEXT_FIELDS = ['title', 'description'] as const;

type LocalizableCategory = { title: string; description?: string | null; translations?: unknown };

export function localizeCategory<T extends LocalizableCategory & { parent?: LocalizableCategory | null }>(
  category: T | null | undefined,
  locale: Locale = 'fa',
): T | null | undefined {
  if (!category) return category;
  const localized = localizeTextFields(category, CATEGORY_TEXT_FIELDS, locale) as T;
  return category.parent
    ? ({ ...localized, parent: localizeTextFields(category.parent, CATEGORY_TEXT_FIELDS, locale) } as T)
    : localized;
}

export const withCategoryTranslations = <T extends { translations?: TextTranslationsDto }>({
  translations,
  ...data
}: T) => ({
  ...data,
  ...(translations !== undefined
    ? { translations: cleanEditions(translations, CATEGORY_TEXT_FIELDS) ?? Prisma.DbNull }
    : {}),
});
