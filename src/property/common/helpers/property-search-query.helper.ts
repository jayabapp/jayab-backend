import { persianSearchVariants, tokenizeSearchText } from './search-text.helper';
import { isEmpty } from 'lodash';
import { Prisma } from '@prisma/client';

type PropertySearchScope = {
  regions: number[];
  cities: number[];
  provinces: number[];
  q?: string;
};

/** `AND` may already hold a single predicate or a list; normalize to a list so nothing is lost. */
export const toAndArray = (value: Prisma.PropertyWhereInput['AND']): Prisma.PropertyWhereInput[] =>
  isEmpty(value) ? [] : Array.isArray(value) ? value : [value];

export const applyPropertySearchScope = (
  base: Prisma.PropertyWhereInput,
  { regions, cities, provinces, q }: PropertySearchScope,
): Prisma.PropertyWhereInput => {
  const location = !isEmpty(regions)
    ? { region_id: { in: regions } }
    : !isEmpty(cities)
      ? { city_id: { in: cities } }
      : !isEmpty(provinces)
        ? { province_id: { in: provinces } }
        : {};

  // هر کلمه باید جایی در عنوان بیاید — نه کل عبارت به‌صورت یک زیررشته‌ی پیوسته.
  //
  // The previous version tested the whole phrase with a single `contains`, so a
  // search for "ویلا تبریز" demanded that exact substring and returned nothing
  // for "ویلا دوبلکس دوخوابه در تبریز": the more precisely a user typed, the
  // fewer results they got. Measured against production, `q=ویلا تبریز` gave 0
  // results while the city+type filters that /extract derived from the very same
  // phrase gave 17.
  //
  // `persianSearchVariants` is here for the same reason `buildCitySuggestionQuery`
  // and `searchSuggestionsV2` already use it: stored titles are not normalized,
  // so a title typed with Arabic ك/ي is unreachable from normalized Persian ک/ی.
  const words = tokenizeSearchText(q ?? '');
  const text = words.map((word) => ({
    OR: persianSearchVariants(word).map((variant) => ({
      title: { contains: variant, mode: Prisma.QueryMode.insensitive },
    })),
  }));

  const merged: Prisma.PropertyWhereInput = { ...base, ...location };
  const and = [...toAndArray(base.AND), ...text];

  return isEmpty(and) ? merged : { ...merged, AND: and };
};

export const buildCitySuggestionQuery = (words: string[], limit: number): Prisma.Sql => {
  const conditions = Prisma.join(
    words.map((term) => {
      const variants = Prisma.join(
        persianSearchVariants(term).map((variant) => Prisma.sql`c.title ILIKE ${`%${variant}%`}`),
        ' OR ',
      );
      return Prisma.sql`(${variants})`;
    }),
    ' AND ',
  );
  const exactMatches = persianSearchVariants(words.join(' '));

  return Prisma.sql`
    SELECT
      c.id,
      c.title,
      CASE
        WHEN c.parent_id IS NULL THEN 'province'
        WHEN p.parent_id IS NULL THEN 'city'
        ELSE 'region'
      END AS level,
      COALESCE(p.title, '') AS parent_title,
      COALESCE(p.id, NULL) AS parent_id,
      COALESCE(g.title, '') AS grandparent_title,
      COALESCE(g.id, NULL) AS grandparent_id
    FROM cities c
    LEFT JOIN cities p ON p.id = c.parent_id
    LEFT JOIN cities g ON g.id = p.parent_id
    WHERE (${conditions}) AND c.deleted_at IS NULL AND c.title != 'استخر'
    ORDER BY
      CASE WHEN c.title IN (${Prisma.join(exactMatches)}) THEN 1 ELSE 2 END,
      CASE
        WHEN c.parent_id IS NULL THEN 1
        WHEN p.parent_id IS NULL THEN 2
        ELSE 3
      END,
      LENGTH(c.title),
      c.title,
      c.id
    LIMIT ${limit}
  `;
};
