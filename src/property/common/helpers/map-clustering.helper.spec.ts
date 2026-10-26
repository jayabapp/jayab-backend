import { buildMapItems, countMapItems, MAP_MAX_ITEMS, MapItem, MapPointInput } from './map-clustering.helper';

const point = (id: number, lat: number, lng: number, price: number | null = 1_000_000): MapPointInput => ({
  id,
  slug: `p${id}`,
  location: { lat, lng, precision: 'approximate', radius_m: 700 },
  price,
});

/** A deterministic scatter inside Iran: no randomness, so a failure is reproducible. */
const scatter = (count: number): MapPointInput[] =>
  Array.from({ length: count }, (_, index) =>
    point(index + 1, 30 + ((index * 37) % 1000) / 100, 48 + ((index * 91) % 1000) / 100),
  );

describe('buildMapItems', () => {
  it('returns nothing for no points', () => {
    expect(buildMapItems([], 10)).toEqual([]);
  });

  it('keeps up to the cap as individual pins with the card price', () => {
    const items = buildMapItems([point(2, 35.7, 51.4, 4_000_000), point(1, 35.8, 51.5, null)], 10);
    expect(items.map((item) => item.type)).toEqual(['property', 'property']);
    expect(items[0]).toMatchObject({ id: 1, price: null, price_basis: 'today_nightly', currency: 'toman' });
    expect(items[1]).toMatchObject({ id: 2, price: 4_000_000 });
  });

  it('never returns more than the cap and never loses a property', () => {
    for (const total of [301, 450, 2000]) {
      const items = buildMapItems(scatter(total), 12);
      expect(items.length).toBeLessThanOrEqual(MAP_MAX_ITEMS);
      expect(countMapItems(items)).toBe(total);
    }
  });

  it('keeps the cap at a very high zoom over a large box by growing the grid', () => {
    const items = buildMapItems(scatter(1500), 19);
    expect(items.length).toBeLessThanOrEqual(MAP_MAX_ITEMS);
    expect(countMapItems(items)).toBe(1500);
  });

  it('clusters points on the same spot even when there are few of them', () => {
    const items = buildMapItems([point(1, 35.7, 51.4), point(2, 35.7, 51.4), point(3, 35.9, 51.6)], 19);
    const cluster = items.find((item) => item.type === 'cluster');
    expect(cluster).toMatchObject({ count: 2, lat: 35.7, lng: 51.4, bounds: [51.4, 35.7, 51.4, 35.7] });
    expect(items.filter((item) => item.type === 'property')).toHaveLength(1);
    expect(countMapItems(items)).toBe(3);
  });

  it('keeps a stack of co-located listings as a cluster at max zoom with a degenerate box', () => {
    const stack = Array.from({ length: 400 }, (_, index) => point(index + 1, 36.5, 52.5));
    const items = buildMapItems(stack, 19);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ type: 'cluster', count: 400, bounds: [52.5, 36.5, 52.5, 36.5] });
  });

  it('gives each cluster bounds that contain every member', () => {
    const points = scatter(800);
    const items = buildMapItems(points, 8);
    const byId = new Map(points.map((entry) => [entry.id, entry]));
    for (const item of items) {
      if (item.type !== 'cluster') continue;
      const [west, south, east, north] = item.bounds;
      const inside = points.filter(
        ({ location }) =>
          location.lng >= west && location.lng <= east && location.lat >= south && location.lat <= north,
      );
      expect(inside.length).toBeGreaterThanOrEqual(item.count);
      expect(item.lng).toBeGreaterThanOrEqual(west);
      expect(item.lng).toBeLessThanOrEqual(east);
      expect(item.lat).toBeGreaterThanOrEqual(south);
      expect(item.lat).toBeLessThanOrEqual(north);
    }
    expect(byId.size).toBe(800);
  });

  it('is deterministic whatever order the points arrive in', () => {
    const points = scatter(700);
    const reversed = [...points].reverse();
    expect(buildMapItems(reversed, 9)).toEqual(buildMapItems(points, 9));
  });

  it('uses display-only cluster ids that carry no record id', () => {
    const items = buildMapItems(scatter(500), 9);
    const ids = items.filter(
      (item): item is Extract<MapItem, { type: 'cluster' }> => item.type === 'cluster',
    );
    expect(ids.length).toBeGreaterThan(0);
    for (const cluster of ids) expect(cluster.id).toMatch(/^grid:/);
    expect(new Set(ids.map((cluster) => cluster.id)).size).toBe(ids.length);
  });
});
