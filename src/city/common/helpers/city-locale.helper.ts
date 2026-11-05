import { localizeTitle } from 'src/common/helpers/title-translations.helper';
import { Locale } from 'src/common/dto/locale.dto';

type CityNode = { title: string; translations?: unknown; child?: CityNode[] };
type LocalizedCityNode<T extends CityNode> = Omit<T, 'translations' | 'child'> & {
  title_locale: Locale;
  child?: LocalizedCityNode<CityNode>[];
};

export function localizeCityTree<T extends CityNode>(item: T, locale: Locale = 'fa'): LocalizedCityNode<T> {
  const { child, ...node } = item;
  return {
    ...localizeTitle(node, locale),
    ...(child ? { child: child.map((city) => localizeCityTree(city, locale)) } : {}),
  } as LocalizedCityNode<T>;
}

export const PLACE_TITLE_SELECT = { select: { title: true, translations: true } } as const;

type Place = { title?: string; translations?: unknown } | null | undefined;

export function localizePlaces<T extends { province?: Place; city?: Place; region?: Place }>(
  item: T,
  locale: Locale = 'fa',
): T {
  const place = (value: Place): Place =>
    value?.title ? localizeTitle({ ...value, title: value.title }, locale) : value;
  return { ...item, province: place(item.province), city: place(item.city), region: place(item.region) } as T;
}

export function localizedName(title: string, translations: unknown, locale: Locale = 'fa'): string {
  return localizeTitle({ title, translations }, locale).title;
}
