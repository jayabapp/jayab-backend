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
