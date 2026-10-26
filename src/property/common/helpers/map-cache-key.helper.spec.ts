import { buildMapCacheKey } from './map-cache-key.helper';

const base = {
  kind: 'map' as const,
  bbox: [51, 35, 52, 36],
  zoom: 10,
  priceDay: '2026-10-26:normal',
  salt: 'unit-test-salt-0123456789',
};

describe('buildMapCacheKey', () => {
  it('does not depend on the order of filter keys or of ids inside a list', () => {
    const a = buildMapCacheKey({ ...base, filters: { cities: '5,2,9', has_pool: 1, total_guests: 4 } });
    const b = buildMapCacheKey({ ...base, filters: { total_guests: 4, has_pool: 1, cities: '9,2,5' } });
    expect(a).toBe(b);
  });

  it('does not split on sort, page or other presentation params', () => {
    const plain = buildMapCacheKey({ ...base, filters: { has_pool: 1 } });
    const noisy = buildMapCacheKey({
      ...base,
      filters: { has_pool: 1, page: 3, per_page: 10, sort_type: 'popular', skip: 0, count_only: 1 },
    });
    expect(noisy).toBe(plain);
  });

  it('ignores empty values but keeps real ones apart', () => {
    expect(buildMapCacheKey({ ...base, filters: { has_pool: 1, q: undefined, title: '' } })).toBe(
      buildMapCacheKey({ ...base, filters: { has_pool: 1 } }),
    );
    expect(buildMapCacheKey({ ...base, filters: { has_pool: 1 } })).not.toBe(
      buildMapCacheKey({ ...base, filters: { has_pool: 0 } }),
    );
  });

  it('changes with the box, the zoom, the locale, the price day and the kind', () => {
    const filters = { has_pool: 1 };
    const key = buildMapCacheKey({ ...base, filters });
    expect(buildMapCacheKey({ ...base, filters, bbox: [51, 35, 52, 37] })).not.toBe(key);
    expect(buildMapCacheKey({ ...base, filters, zoom: 11 })).not.toBe(key);
    expect(buildMapCacheKey({ ...base, filters, locale: 'en' })).not.toBe(key);
    expect(buildMapCacheKey({ ...base, filters, priceDay: '2026-10-27:normal' })).not.toBe(key);
    expect(buildMapCacheKey({ ...base, filters, kind: 'histogram' })).not.toBe(key);
  });

  it('treats dates by day and changes with the salt without exposing it', () => {
    const a = buildMapCacheKey({ ...base, filters: { checkin: new Date('2026-11-01T08:00:00Z') } });
    const b = buildMapCacheKey({ ...base, filters: { checkin: new Date('2026-11-01T20:00:00Z') } });
    expect(a).toBe(b);
    const rotated = buildMapCacheKey({ ...base, salt: 'another-salt-0123456789', filters: {} });
    expect(rotated).not.toBe(buildMapCacheKey({ ...base, filters: {} }));
    expect(rotated).not.toContain('another-salt');
    expect(a).not.toContain(base.salt);
  });
});
