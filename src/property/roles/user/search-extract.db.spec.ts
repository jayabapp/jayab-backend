import { buildLocationCandidateQuery } from 'src/property/common/helpers/property-search-query.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import { PropertySearchSuggestionUserDto } from './dto/find-all.dto';
import { PropertyUserService } from './user.service';

/**
 * The search box against a real PostgreSQL database, read-only. A mocked Prisma client cannot
 * catch SQL that PostgreSQL rejects, which is how `jsonb ~~* unknown` (42883) reached production.
 * Opt-in, because CI has no database: SEARCH_DB_TESTS=1 with DATABASE_URL pointing at a copy of
 * the data. Place-specific checks look their place up first and skip when the data lacks it.
 */
const describeDb = process.env.SEARCH_DB_TESTS === '1' ? describe : describe.skip;

type Place = { id: number; title: string; en: string | null };

describeDb('search box against PostgreSQL', () => {
  const db = new PrismaClient();
  const service = new PropertyUserService(null, db as unknown as PrismaService, null, null, null, null, null);
  const search = (q: string): ReturnType<PropertyUserService['search']> =>
    service.search({ q } as PropertySearchSuggestionUserDto);
  const locationIds = (query: Record<string, string | number>): number[] =>
    ['provinces', 'cities', 'regions'].flatMap((key) =>
      String(query[key] ?? '')
        .split(',')
        .filter(Boolean)
        .map(Number),
    );
  let ramsar: Place | undefined;
  let yehKafPlace: Place | undefined;

  beforeAll(async () => {
    [ramsar] = await db.$queryRaw<Place[]>`
      SELECT id, title, translations->'en'->>'title' AS en
      FROM cities WHERE deleted_at IS NULL AND title = 'رامسر' ORDER BY id LIMIT 1`;
    // A single-word name with ی or ک, to search with the Arabic letter forms.
    [yehKafPlace] = await db.$queryRaw<Place[]>`
      SELECT id, title, NULL AS en FROM cities
      WHERE deleted_at IS NULL AND title ~ '^[^ ]*[یک][^ ]*$' AND title <> 'استخر' AND length(title) > 3
      ORDER BY id LIMIT 1`;
  });

  afterAll(() => db.$disconnect());

  it('runs the location lookup without a PostgreSQL error (42883)', async () => {
    const query = buildLocationCandidateQuery(['رامسر', 'Ramsar', 'طهران', 'استخر', 'ناشناخته']);
    await expect(db.$queryRaw(query)).resolves.toEqual(expect.any(Array));
  });

  it.each([
    'رامسر',
    'ویلای رامسر',
    'اجاره خانه ویلای رامسر',
    'اجاره ویلا رامسر',
    'خانه در رامسر',
    'Ramsar',
    'اجاره ویلا',
    'اجاره',
    'رامسر استخر',
    'یک عبارت ناشناخته',
    'رامسر رامسر',
    '  رامسر    ویلا  ',
    'رامسر!؟، ویلا.',
    'ویلا Ramsar',
    'شهرناموجودهیچجا',
    '   ',
  ])('answers %p with the normal response shape', async (q) => {
    const result = await search(q);
    expect(Object.keys(result).sort()).toEqual(
      ['cities_list', 'client_query', 'ignored_terms', 'landing_url', 'matched_order', 'property'].sort(),
    );
    expect(result).toMatchObject({
      client_query: expect.any(Object),
      cities_list: expect.any(Array),
      matched_order: expect.any(Array),
      property: null,
      ignored_terms: expect.any(Array),
    });
    expect(result.landing_url === null || typeof result.landing_url === 'string').toBe(true);
  });

  it.each([
    'رامسر',
    'ویلای رامسر',
    'اجاره خانه ویلای رامسر',
    'اجاره ویلا رامسر',
    'خانه در رامسر',
    'رامسر رامسر',
    '  رامسر    ویلا  ',
    'رامسر!؟، ویلا.',
  ])('reads Ramsar out of %p', async (q) => {
    if (!ramsar) return;
    const result = await search(q);
    expect(result.client_query.cities).toBe(String(ramsar.id));
    expect(result.client_query.q ?? '').not.toContain('رامسر');
    expect(result.ignored_terms).not.toContain('رامسر');
  });

  it('reads Ramsar out of its English name in any case', async () => {
    if (!ramsar?.en) return;
    for (const q of [ramsar.en, ramsar.en.toUpperCase(), `ویلا ${ramsar.en.toLowerCase()}`]) {
      expect((await search(q)).client_query.cities).toBe(String(ramsar.id));
    }
  });

  it('keeps the pool word as a pool filter, never a place', async () => {
    if (!ramsar) return;
    const result = await search('رامسر استخر');
    expect(result.client_query).toMatchObject({ cities: String(ramsar.id), has_pool: 1 });
  });

  it('reads villa without a place, and nothing from a rent word alone', async () => {
    const villa = await search('اجاره ویلا');
    expect(villa.client_query.property_type).toBeDefined();
    expect(locationIds(villa.client_query)).toEqual([]);
    expect((await search('اجاره')).client_query).toEqual({});
    expect((await search('   ')).client_query).toEqual({});
  });

  it('finds a place typed with Arabic yeh and kaf', async () => {
    if (!yehKafPlace) return;
    const arabic = yehKafPlace.title.replace(/ی/g, 'ي').replace(/ک/g, 'ك');
    const result = await search(arabic);
    expect(locationIds(result.client_query)).toContain(Number(yehKafPlace.id));
  });
});
