import { Prisma } from '@prisma/client';
import { applyPropertySearchScope, buildCitySuggestionQuery } from './property-search-query.helper';

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

  it('keeps user input in Prisma values instead of SQL text', () => {
    const payload = "تهران%' OR 1=1 --";
    const query = buildCitySuggestionQuery([payload], 3);

    expect(query.strings.join('')).not.toContain(payload);
    expect(query.values).toContain(`%${payload}%`);
    expect(query.values).toContain(3);
  });
});
