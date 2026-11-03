import { TitleTranslationsDto } from '../dto/title-translations.dto';
import { Prisma } from '@prisma/client';
import { Locale } from '../dto/locale.dto';

export function localizeTitle<T extends { title: string; translations?: unknown }>(
  item: T,
  locale: Locale = 'fa',
): Omit<T, 'translations'> & { title_locale: Locale } {
  const { translations, ...result } = item;
  const edition = translations && typeof translations === 'object' ? translations[locale] : undefined;
  const title = edition && typeof edition.title === 'string' ? edition.title.trim() : '';
  if (locale !== 'fa' && title) return { ...result, title, title_locale: locale };
  return { ...result, title_locale: 'fa' };
}

export function withTitleTranslations<T extends object>(
  dto: T & { translations?: TitleTranslationsDto },
): Omit<T, 'translations'> & { translations?: Prisma.InputJsonObject } {
  const { translations, ...data } = dto;
  return {
    ...data,
    ...(translations != null
      ? { translations: JSON.parse(JSON.stringify(translations)) as Prisma.InputJsonObject }
      : {}),
  };
}
