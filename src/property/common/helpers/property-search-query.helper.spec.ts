import { Prisma } from '@prisma/client';
import { applyPropertySearchScope, buildCitySuggestionQuery } from './property-search-query.helper';
import { buildFuzzyCityQuery } from './property-search-query.helper';
import { buildLocationCandidateQuery, EXCLUDED_LOCATION_TITLE } from './property-search-query.helper';

describe('property search query helpers', () => {
  it('matches each word separately instead of the whole phrase', () => {
    const where = applyPropertySearchScope(
      { status: 30 },
      { regions: [], cities: [12], provinces: [], q: 'ویلا تبریز' },
    );

    expect(where.status).toBe(30);
    expect(where.city_id).toEqual({ in: [12] });
    // A single `title: { contains: 'ویلا تبریز' }` would demand that exact
    // substring and miss "ویلا دوبلکس دوخوابه در تبریز".
    expect(where).not.toHaveProperty('title');
    expect(where.AND).toHaveLength(2);
  });

  it('accepts either Persian or Arabic spelling of a stored title', () => {
    const where = applyPropertySearchScope(
      { status: 30 },
      { regions: [], cities: [], provinces: [], q: 'كيش' },
    );

    const variants = (where.AND as Prisma.PropertyWhereInput[])[0].OR as Prisma.PropertyWhereInput[];
    const needles = variants.map((clause) => (clause.title as Prisma.StringFilter).contains);

    expect(needles).toEqual(expect.arrayContaining(['کیش', 'كيش']));
    variants.forEach((clause) =>
      expect((clause.title as Prisma.StringFilter).mode).toBe(Prisma.QueryMode.insensitive),
    );
  });

  it('keeps predicates already present on AND', () => {
    const where = applyPropertySearchScope(
      { status: 30, AND: [{ has_pool: true }] },
      { regions: [], cities: [], provinces: [], q: 'کیش' },
    );

    expect(where.AND).toHaveLength(2);
    expect((where.AND as Prisma.PropertyWhereInput[])[0]).toEqual({ has_pool: true });
  });

  it('adds no text predicate when there is no query', () => {
    const where = applyPropertySearchScope({ status: 30 }, { regions: [], cities: [7], provinces: [] });

    expect(where).toEqual({ status: 30, city_id: { in: [7] } });
  });

  it('lets a numeric word match a listing code as well as a title', () => {
    const where = applyPropertySearchScope(
      { status: 30 },
      { regions: [], cities: [], provinces: [], q: '12345' },
    );

    const clauses = (where.AND as Prisma.PropertyWhereInput[])[0].OR as Prisma.PropertyWhereInput[];
    expect(clauses).toContainEqual({ code: '12345' });
    expect(clauses.some((clause) => clause.title)).toBe(true);
  });

  it('keeps fuzzy city terms in Prisma values instead of SQL text', () => {
    const payload = "گویم' OR 1=1 --";
    const query = buildFuzzyCityQuery([payload], 0.45);

    expect(query.strings.join('')).not.toContain(payload);
    expect(query.values).toContain(payload);
    expect(query.values).toContain(0.45);
  });

  it('keeps user input in Prisma values instead of SQL text', () => {
    const payload = "تهران%' OR 1=1 --";
    const query = buildCitySuggestionQuery([payload], 3);

    expect(query.strings.join('')).not.toContain(payload);
    expect(query.values).toContain(`%${payload}%`);
    expect(query.values).toContain(3);
  });

  describe('location candidate query', () => {
    it('has nothing to run without spans', () => {
      expect(buildLocationCandidateQuery([])).toBeNull();
    });

    it('reads translated names as text and never applies ILIKE to jsonb', () => {
      const sql = buildLocationCandidateQuery(['Ramsar', 'رامسر'])!.strings.join('');

      expect(sql).toContain("c.translations->'en'->>'title'");
      expect(sql).toContain("c.translations->'ar'->>'title'");
      expect(sql).not.toMatch(/ILIKE|#>/i);
    });

    it('binds folded, space-free span text and the excluded pool word as values', () => {
      const payload = "رامسر';drop--";
      const query = buildLocationCandidateQuery(['RAMSAR', 'كرج', 'بندر عباس', payload])!;

      expect(query.strings.join('')).not.toContain(payload);
      expect(query.values).toEqual(
        expect.arrayContaining(['ramsar', 'کرج', 'بندرعباس', payload, EXCLUDED_LOCATION_TITLE]),
      );
    });

    it('keeps three comparisons however many spans and spellings there are', () => {
      const comparisons = (texts: string[]): number =>
        buildLocationCandidateQuery(texts)!.strings.join('').split('= ANY(').length - 1;

      expect(comparisons(['رامسر'])).toBe(3);
      expect(comparisons(['اجاره', 'خانه', 'ویلای', 'رامسر', 'خانه ویلای', 'ویلای رامسر', 'RAMSAR'])).toBe(3);
    });
  });

  it('also finds a place by its English or Arabic name, hamza or not', () => {
    const english = buildCitySuggestionQuery(['tehran'], 5);
    expect(english.strings.join('')).toContain("translations->'en'->>'title'");
    expect(english.values).toContain('%tehran%');

    const arabic = buildCitySuggestionQuery(['أصفهان'], 5);
    expect(arabic.values).toContain('%اصفهان%');
  });
});
