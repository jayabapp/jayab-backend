import { Prisma } from '@prisma/client';
import { Locale } from 'src/common/dto/locale.dto';

export function localizePropertyText(
  original: string | null | undefined,
  translations: Prisma.JsonValue | undefined,
  field: 'title' | 'address',
  locale: Locale = 'fa',
): { value: string | null | undefined; locale: Locale } {
  const edition = translations && typeof translations === 'object' ? translations[locale] : undefined;
  const value = edition && typeof edition[field] === 'string' ? edition[field].trim() : '';
  return locale !== 'fa' && value ? { value, locale } : { value: original, locale: 'fa' };
}
