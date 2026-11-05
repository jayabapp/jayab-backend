import { persianSearchVariants, tokenizeSearchText } from './search-text.helper';
import { normalizeTranslatedSearchText } from './search-text.helper';
import { isEmpty } from 'lodash';
import { Prisma } from '@prisma/client';

type PropertySearchScope = {
  q?: string;
  cities: number[];
  regions: number[];
  provinces: number[];
};

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

  const words = tokenizeSearchText(q ?? '');
  const text = words.map((word) => ({
    OR: [
      ...persianSearchVariants(word).map((variant) => ({
        title: { contains: variant, mode: Prisma.QueryMode.insensitive },
      })),
      ...(/^\d+$/.test(word) ? [{ code: word }] : []),
    ],
  }));

  const merged: Prisma.PropertyWhereInput = { ...base, ...location };
  const and = [...toAndArray(base.AND), ...text];

  return isEmpty(and) ? merged : { ...merged, AND: and };
};

export const buildFuzzyCityQuery = (terms: string[], threshold: number): Prisma.Sql => Prisma.sql`
  SELECT DISTINCT ON (t.term)
    t.term,
    c.id,
    c.title,
    c.parent_id,
    p.parent_id AS grandparent_id
  FROM unnest(ARRAY[${Prisma.join(terms)}]::text[]) AS t(term)
  JOIN cities c
    ON c.deleted_at IS NULL
    AND c.title % t.term
    AND similarity(c.title, t.term) >= ${threshold}::real
  LEFT JOIN cities p ON p.id = c.parent_id
  WHERE c.title != 'استخر'
  ORDER BY t.term, similarity(c.title, t.term) DESC, LENGTH(c.title), c.id
`;

const translatedTitlesSql = (alias: string): Prisma.Sql =>
  Prisma.raw(
    `translate(coalesce(${alias}.translations->'en'->>'title', '') || ' ' || ` +
      `coalesce(${alias}.translations->'ar'->>'title', ''), 'أإآيىكة', 'اااییکه')`,
  );

export const buildCitySuggestionQuery = (words: string[], limit: number): Prisma.Sql => {
  const translated = translatedTitlesSql('c');
  const conditions = Prisma.join(
    words.map((term) => {
      const variants = Prisma.join(
        [
          ...persianSearchVariants(term).map((variant) => Prisma.sql`c.title ILIKE ${`%${variant}%`}`),
          Prisma.sql`${translated} ILIKE ${`%${normalizeTranslatedSearchText(term)}%`}`,
        ],
        ' OR ',
      );
      return Prisma.sql`(${variants})`;
    }),
    ' AND ',
  );
  const phrase = words.join(' ');
  const exactMatches = persianSearchVariants(phrase);
  const exactTranslated = normalizeTranslatedSearchText(phrase).toLowerCase();

  return Prisma.sql`
    SELECT
      c.id,
      c.title,
      c.translations,
      p.translations AS parent_translations,
      g.translations AS grandparent_translations,
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
      CASE
        WHEN c.title IN (${Prisma.join(exactMatches)})
          OR lower(coalesce(c.translations->'en'->>'title', '')) = ${exactTranslated}
          OR translate(coalesce(c.translations->'ar'->>'title', ''), 'أإآيىكة', 'اااییکه') = ${exactTranslated}
        THEN 1 ELSE 2
      END,
      CASE
        WHEN p.parent_id IS NULL AND c.parent_id IS NOT NULL THEN 1
        WHEN c.parent_id IS NULL THEN 2
        ELSE 3
      END,
      LENGTH(c.title),
      c.title,
      c.id
    LIMIT ${limit}
  `;
};
