import { persianSearchVariants, tokenizeSearchText } from './search-text.helper';
import { persianTitleKey, translatedTitleKey } from './search-text.helper';
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

/** A pool word, not a place: never read it as a location even though a neighbourhood is named so. */
export const EXCLUDED_LOCATION_TITLE = 'استخر';

const DIGITS_FROM = '۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩';
const DIGITS_TO = '01234567890123456789';
// Zero-width non-joiner/joiner and direction marks; translate() drops characters it has no target for.
const INVISIBLE = '\u200c\u200d\u200e\u200f';
// Space, tab, line feed, carriage return and no-break space: deleted, not collapsed.
const WHITESPACE = '\u0020\u0009\u000a\u000d\u00a0';
const PERSIAN_FOLD = { from: `يىك${DIGITS_FROM}${INVISIBLE}${WHITESPACE}`, to: `ییک${DIGITS_TO}` };
const TRANSLATED_FOLD = { from: `يىكأإآة${DIGITS_FROM}${INVISIBLE}${WHITESPACE}`, to: `ییکاااه${DIGITS_TO}` };

const foldedTitleSql = (column: Prisma.Sql, fold: { from: string; to: string }): Prisma.Sql =>
  Prisma.sql`lower(translate(${column}, ${fold.from}, ${fold.to}))`;

const withoutSpaces = (key: string): string => key.split(' ').join('');

export const buildLocationCandidateQuery = (spanTexts: string[]): Prisma.Sql | null => {
  const keys = (toKey: (text: string) => string): string[] =>
    [...new Set(spanTexts.map((text) => withoutSpaces(toKey(text))))].filter(Boolean);
  const persianKeys = keys(persianTitleKey);
  const translatedKeys = keys(translatedTitleKey);
  if (persianKeys.length === 0 || translatedKeys.length === 0) return null;

  return Prisma.sql`
    SELECT k.id, k.title, k.translations, k.parent_id, p.parent_id AS grandparent_id
    FROM (
      SELECT
        c.id,
        c.title,
        c.translations,
        c.parent_id,
        ${foldedTitleSql(Prisma.sql`c.title`, PERSIAN_FOLD)} AS title_key,
        ${foldedTitleSql(Prisma.sql`c.translations->'en'->>'title'`, TRANSLATED_FOLD)} AS en_key,
        ${foldedTitleSql(Prisma.sql`c.translations->'ar'->>'title'`, TRANSLATED_FOLD)} AS ar_key
      FROM cities c
      WHERE c.deleted_at IS NULL
    ) k
    LEFT JOIN cities p ON p.id = k.parent_id
    WHERE k.title_key <> ${withoutSpaces(persianTitleKey(EXCLUDED_LOCATION_TITLE))}
      AND (
        k.title_key = ANY(ARRAY[${Prisma.join(persianKeys)}]::text[])
        OR k.en_key = ANY(ARRAY[${Prisma.join(translatedKeys)}]::text[])
        OR k.ar_key = ANY(ARRAY[${Prisma.join(translatedKeys)}]::text[])
      )
  `;
};

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
