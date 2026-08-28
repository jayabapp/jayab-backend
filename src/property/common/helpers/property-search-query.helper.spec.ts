import { Prisma } from '@prisma/client';
import { applyPropertySearchScope, buildCitySuggestionQuery } from './property-search-query.helper';

describe('property search query helpers', () => {
  it('combines the city filter and normalized text as AND predicates', () => {
    const where = applyPropertySearchScope(
      { status: 30 },
      { regions: [], cities: [12], provinces: [], q: 'كيش' },
    );

    expect(where).toEqual({
      status: 30,
      city_id: { in: [12] },
      title: { contains: 'کیش', mode: Prisma.QueryMode.insensitive },
    });
    expect(where).not.toHaveProperty('OR');
  });

  it('keeps user input in Prisma values instead of SQL text', () => {
    const payload = "تهران%' OR 1=1 --";
    const query = buildCitySuggestionQuery([payload], 3);

    expect(query.strings.join('')).not.toContain(payload);
    expect(query.values).toContain(`%${payload}%`);
    expect(query.values).toContain(3);
  });
});
