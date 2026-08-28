import { normalizePersianSearchText, persianSearchVariants } from './search-text.helper';
import { isEmpty } from 'lodash';
import { Prisma } from '@prisma/client';

type PropertySearchScope = {
  regions: number[];
  cities: number[];
  provinces: number[];
  q?: string;
};

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

  const normalizedQuery = normalizePersianSearchText(q ?? '');
  const text = normalizedQuery
    ? { title: { contains: normalizedQuery, mode: Prisma.QueryMode.insensitive } }
    : {};

  return { ...base, ...location, ...text };
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
