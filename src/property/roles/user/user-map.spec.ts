import { BadRequestException, NotFoundException } from '@nestjs/common';
import { buildApproxLocation } from 'src/property/common/helpers/approx-location.helper';
import { countMapItems, MAP_MAX_ITEMS } from 'src/property/common/helpers/map-clustering.helper';
import { resolveDisplayPrice } from 'src/property/common/effective-price.helper';
import { PropertySerializer, PropertyJsonType } from 'src/property/serializer/property.serializer';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyUserService } from './user.service';
import { DayColumn } from 'src/common/helpers/day.helper';
import { startOfToday } from 'src/common/helpers/date.helper';

const SALT = 'unit-test-salt-0123456789';
const TODAY = DayColumn.normal;

type Row = {
  id: number;
  slug: string;
  code: string;
  lat: number | null;
  lng: number | null;
  is_location_visible: boolean | null;
  favorite_count: number;
  daily_price: { normal: number };
  calendar: Array<Record<string, number | null>>;
};

const row = (
  id: number,
  lat: number | null,
  lng: number | null,
  visible: boolean | null,
  extras: Partial<Row> = {},
): Row => ({
  id,
  slug: `${id}-villa`,
  code: String(id),
  lat,
  lng,
  is_location_visible: visible,
  favorite_count: 12,
  daily_price: { normal: 3_000_000 },
  calendar: [],
  ...extras,
});

/** The ids a query was narrowed to, read from the `AND: [{ id: { in } }]` the list adds. */
const idsInWhere = (where: any): number[] | null => {
  const clause = (where?.AND ?? []).find((entry: any) => entry?.id?.in);
  return clause ? clause.id.in : null;
};

const setup = (rows: Row[], salt: string | null = SALT) => {
  const store = new Map<string, string>();
  const redis = {
    get: jest.fn(async (key: string) => store.get(key) ?? null),
    set: jest.fn(async (key: string, value: string) => void store.set(key, value)),
  };
  const db = {
    property: {
      // Candidate reads (a `select`) and the list's own read (an `include`) both see the rows,
      // narrowed by the id filter exactly as the database would narrow them.
      findMany: jest.fn(async (args: any) => {
        const ids = idsInWhere(args.where);
        return rows.filter((entry) => (ids ? ids.includes(entry.id) : true));
      }),
      count: jest.fn(async (args: any) => {
        const ids = idsInWhere(args.where);
        return rows.filter((entry) => (ids ? ids.includes(entry.id) : true)).length;
      }),
      findFirst: jest.fn(async (args: any) => rows.find((entry) => entry.id === args.where.id) ?? null),
    },
  };
  const config = { get: jest.fn((key: string) => (key === 'location.obfuscationSalt' ? salt : undefined)) };
  const dayHelper = { today: jest.fn(async () => TODAY) };
  const serializer = new PropertySerializer(config as any);
  const listSerializer = {
    toArray: jest.fn(async (data: any[]) => data.map(({ id }) => ({ id }))),
  };
  const service = new PropertyUserService(
    redis as any,
    db as unknown as PrismaService,
    listSerializer as any,
    dayHelper as any,
    config as any,
    null,
    null,
  );
  return { service, db, redis, serializer, config, dayHelper, listSerializer };
};

const around = (lat: number, lng: number, half = 0.0004): string =>
  `${lng - half},${lat - half},${lng + half},${lat + half}`;

describe('public location in the map and the list', () => {
  it('gives an explicit canonical premium filter priority over its legacy alias', () => {
    const { service } = setup([]);
    expect(service.buildDiscoveryQuery({ is_premium: 1 }).has_blue_tick).toBe(true);
    expect(service.buildDiscoveryQuery({ has_blue_tick: true, is_premium: 0 } as any).has_blue_tick).toBe(
      true,
    );
    expect(
      service.buildDiscoveryQuery({ has_blue_tick: false, is_premium: 1 } as any).has_blue_tick,
    ).toBeUndefined();
    expect(service.buildDiscoveryQuery({ has_blue_tick: 0, is_premium: 1 }).has_blue_tick).toBeUndefined();
  });

  it('matches a hidden listing at its approximate point, never at its real one', async () => {
    const hidden = row(7, 36.7025, 52.6512, false);
    const approx = buildApproxLocation(7, hidden.lat, hidden.lng, SALT);
    const { service } = setup([hidden]);

    const atApprox = await service.findMap({ bbox: around(approx.lat, approx.lng), zoom: 15 } as any);
    expect(atApprox.meta.total).toBe(1);
    expect(atApprox.items[0]).toMatchObject({
      type: 'property',
      id: 7,
      location: { precision: 'approximate', radius_m: 700, lat: approx.lat, lng: approx.lng },
    });

    // A box tightly around the REAL coordinates must not find it: that is what would leak it.
    const atReal = await setup([hidden]).service.findMap({
      bbox: around(hidden.lat, hidden.lng, 0.0005),
      zoom: 15,
    } as any);
    expect(atReal.meta.total).toBe(0);
    expect(JSON.stringify(atApprox)).not.toContain(String(hidden.lat));
    expect(JSON.stringify(atApprox)).not.toContain(String(hidden.lng));
  });

  it('matches a public listing at its exact point', async () => {
    const visible = row(3, 36.7025, 52.6512, true);
    const { service } = setup([visible]);
    const result = await service.findMap({ bbox: around(36.7025, 52.6512), zoom: 15 } as any);
    expect(result.items[0]).toMatchObject({
      id: 3,
      favorite_count: 12,
      location: { precision: 'exact', radius_m: 0, lat: 36.7025, lng: 52.6512 },
    });
  });

  it('leaves out hidden listings when the salt is invalid, instead of using their real point', async () => {
    const hidden = row(7, 36.7025, 52.6512, false);
    const visible = row(8, 36.7026, 52.6513, true);
    for (const salt of [null, '', 'short']) {
      const { service } = setup([hidden, visible], salt);
      const result = await service.findMap({ bbox: around(36.7025, 52.6512, 0.01), zoom: 12 } as any);
      expect(result.items.map((item: any) => item.id)).toEqual([8]);
      expect(result.meta.total).toBe(1);
    }
  });

  it('leaves out listings with no usable coordinates when a box is given', async () => {
    const { service } = setup([
      row(1, null, null, true),
      row(2, Number.NaN, 52, true),
      row(3, 36.7, 52.6, true),
    ]);
    const result = await service.findMap({ bbox: '50,30,55,40', zoom: 8 } as any);
    expect(result.items.map((item: any) => item.id)).toEqual([3]);
  });
});

describe('map and list agree', () => {
  const rows = [
    row(1, 36.7, 52.6, true),
    row(2, 36.71, 52.61, true),
    row(3, 36.72, 52.62, false),
    row(4, 40.0, 60.0, true), // far outside the box
    row(5, null, null, true), // no location
    row(6, 36.73, 52.63, false),
  ];

  it('returns the same ids and the same total for the same filters and box', async () => {
    const { service, db } = setup(rows);
    const dto = { bbox: '52,36,53,37', has_pool: 1 };

    const map = await service.findMap({ ...dto, zoom: 12 } as any);
    const list = await service.findAll({ ...dto, page: 1, per_page: 30 } as any);

    const mapIds = map.items.map((item: any) => item.id).sort();
    const listIds = list.data.map(({ id }) => id).sort();
    expect(listIds).toEqual(mapIds);
    expect(list.meta.total).toBe(map.meta.total);
    expect(map.meta.total).toBe(countMapItems(map.items));
    expect(mapIds).not.toContain(4);
    expect(mapIds).not.toContain(5);

    // Both read the same conditions: published only, and the same filter.
    const wheres = db.property.findMany.mock.calls.map(([args]) => args.where);
    for (const where of wheres) {
      expect(where.status).toBe(PropertyStatuses.PUBLISHED);
      expect(where.has_pool).toBe(true);
    }
  });

  it('narrows an id filter that is already there instead of replacing it', async () => {
    const { service, db } = setup(rows);
    await service.findAll({ bbox: '52,36,53,37', page: 1, per_page: 30 } as any, false, [1, 2, 3]);
    const listWhere = db.property.findMany.mock.calls.at(-1)[0].where;
    expect(listWhere.id).toEqual({ in: [1, 2, 3] });
    expect(idsInWhere(listWhere)).toEqual(expect.arrayContaining([1, 2]));
  });

  it('keeps unlocated listings in a list that has no box', async () => {
    const { service, db } = setup(rows);
    await service.findAll({ page: 1, per_page: 30 } as any);
    expect(idsInWhere(db.property.findMany.mock.calls[0][0].where)).toBeNull();
  });
});

describe('the box is validated and never ignored', () => {
  it.each([
    ['empty', ''],
    ['not numbers', 'a,b,c,d'],
    ['NaN', 'NaN,1,2,3'],
    ['inverted', '53,36,52,37'],
    ['too few', '52,36,53'],
  ])('answers 400 with a message code for a %s box', async (_name: string, bbox: string) => {
    const { service, db } = setup([]);
    await expect(service.findMap({ bbox, zoom: 10 } as any)).rejects.toThrow(BadRequestException);
    await expect(service.findMap({ bbox, zoom: 10 } as any)).rejects.toThrow('PROPERTY_MAP_BBOX_INVALID');
    await expect(service.findAll({ bbox, page: 1 } as any)).rejects.toThrow('PROPERTY_MAP_BBOX_INVALID');
    await expect(service.findPriceHistogram({ bbox } as any)).rejects.toThrow('PROPERTY_MAP_BBOX_INVALID');
    expect(db.property.findMany).not.toHaveBeenCalled();
  });

  it('does not require a box for the histogram or the plain list', async () => {
    const { service } = setup([row(1, 36.7, 52.6, true)]);
    await expect(service.findPriceHistogram({} as any)).resolves.toMatchObject({ total_priced: 1 });
    await expect(service.findAll({ page: 1 } as any)).resolves.toBeDefined();
  });
});

describe('clusters', () => {
  it('turns a dense box into clusters without losing a listing and reports the true total', async () => {
    const rows = Array.from({ length: 800 }, (_, index) =>
      row(index + 1, 36 + ((index * 37) % 1000) / 1000, 52 + ((index * 91) % 1000) / 1000, true),
    );
    const { service } = setup(rows);
    const result = await service.findMap({ bbox: '51,35,54,38', zoom: 12 } as any);

    expect(result.meta.total).toBe(800);
    expect(result.meta.is_clustered).toBe(true);
    expect(result.meta.is_truncated).toBe(false);
    expect(result.items.length).toBeLessThanOrEqual(MAP_MAX_ITEMS);
    expect(result.meta.returned_items).toBe(result.items.length);
    expect(countMapItems(result.items)).toBe(800);
  });

  it('keeps individual pins when the result fits the cap', async () => {
    const { service } = setup([row(1, 36.7, 52.6, true), row(2, 36.8, 52.7, true)]);
    const result = await service.findMap({ bbox: '50,30,55,40', zoom: 9 } as any);
    expect(result.meta.is_clustered).toBe(false);
    expect(result.items.every((item: any) => item.type === 'property')).toBe(true);
  });
});

describe('prices', () => {
  it('shows the same price on the pin as on the card', async () => {
    const discounted = row(1, 36.7, 52.6, true, {
      calendar: [
        {
          date: startOfToday().getTime(),
          price: 5_000_000,
          discounted_price: 4_000_000,
          discount_percentage: 20,
          effective_price: 4_000_000,
        },
      ],
    });
    const plain = row(2, 36.71, 52.61, true);
    const zero = row(3, 36.72, 52.62, true, { daily_price: { normal: 0 } });
    const { service, serializer } = setup([discounted, plain, zero]);

    const map = await service.findMap({ bbox: '50,30,55,40', zoom: 9 } as any);
    const cards = await serializer.toArray(
      [discounted, plain, zero].map((entry) => ({ ...entry, title: 'x' })) as unknown as PropertyJsonType[],
      TODAY,
      false,
      false,
      'fa',
    );
    for (const card of cards) {
      const pin = map.items.find((item: any) => item.id === card.id) as any;
      expect(pin.price).toBe(resolveDisplayPrice(card.today_price));
    }
    expect((map.items.find((item: any) => item.id === 1) as any).price).toBe(4_000_000);
    expect((map.items.find((item: any) => item.id === 3) as any).price).toBeNull();
  });

  it('applies the price range the same way the list does', async () => {
    const rows = [
      row(1, 36.7, 52.6, true, { daily_price: { normal: 1_000_000 } }),
      row(2, 36.71, 52.61, true, { daily_price: { normal: 3_000_000 } }),
      row(3, 36.72, 52.62, true, { daily_price: { normal: 9_000_000 } }),
    ];
    const { service } = setup(rows);
    const map = await service.findMap({
      bbox: '50,30,55,40',
      zoom: 9,
      min_price: 2_000_000,
      max_price: 5_000_000,
    } as any);
    expect(map.items.map((item: any) => item.id)).toEqual([2]);
    expect(map.meta.total).toBe(1);
  });
});

describe('price histogram', () => {
  it('ignores the chosen price range so the distribution does not collapse', async () => {
    const rows = [1, 2, 3, 4].map((id) =>
      row(id, 36.7 + id / 100, 52.6, true, { daily_price: { normal: id * 1_000_000 } }),
    );
    const { service } = setup(rows);
    const histogram = await service.findPriceHistogram({ min_price: 3_000_000, max_price: 3_500_000 } as any);
    expect(histogram).toMatchObject({ min: 1_000_000, max: 4_000_000, total_priced: 4, currency: 'toman' });
    expect(histogram.bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(4);
  });

  it('uses the same box as the list', async () => {
    const rows = [row(1, 36.7, 52.6, true), row(2, 40, 60, true)];
    const { service } = setup(rows);
    const histogram = await service.findPriceHistogram({ bbox: '52,36,53,37' } as any);
    expect(histogram.total_priced).toBe(1);
  });
});

describe('caching', () => {
  it('serves the second identical request from the cache, whatever the sort or page', async () => {
    const { service, db, redis } = setup([row(1, 36.7, 52.6, true)]);
    const dto = { bbox: '50,30,55,40', zoom: 9, has_pool: 1 };
    await service.findMap(dto as any);
    await service.findMap({ ...dto, sort_type: 'popular', page: 4 } as any);
    expect(db.property.findMany).toHaveBeenCalledTimes(1);
    expect(redis.set).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'EX', 30);
  });

  it('does not mix different boxes, zooms or filters', async () => {
    const { service, db } = setup([row(1, 36.7, 52.6, true)]);
    await service.findMap({ bbox: '50,30,55,40', zoom: 9 } as any);
    await service.findMap({ bbox: '50,30,55,41', zoom: 9 } as any);
    await service.findMap({ bbox: '50,30,55,40', zoom: 10 } as any);
    await service.findMap({ bbox: '50,30,55,40', zoom: 9, has_pool: 1 } as any);
    expect(db.property.findMany).toHaveBeenCalledTimes(4);
  });

  it('still answers when the cache is down', async () => {
    const { service, redis } = setup([row(1, 36.7, 52.6, true)]);
    redis.get.mockRejectedValue(new Error('down'));
    redis.set.mockRejectedValue(new Error('down'));
    await expect(service.findMap({ bbox: '50,30,55,40', zoom: 9 } as any)).resolves.toMatchObject({
      meta: { total: 1 },
    });
  });

  it('keeps nothing role-specific in what it stores', async () => {
    const { service, redis } = setup([row(1, 36.7, 52.6, true)]);
    await service.findMap({ bbox: '50,30,55,40', zoom: 9 } as any);
    const stored = redis.set.mock.calls[0][1] as string;
    expect(stored).not.toMatch(/commission|owner|mobile/i);
  });
});

describe('map preview', () => {
  it('is a not-found for a missing or unpublished listing', async () => {
    const { service, db } = setup([]);
    await expect(service.findMapPreview(99)).rejects.toThrow(NotFoundException);
    expect(db.property.findFirst.mock.calls[0][0].where).toMatchObject({
      id: 99,
      status: PropertyStatuses.PUBLISHED,
    });
  });

  it('always builds the guest card', async () => {
    const { service, listSerializer } = setup([row(5, 36.7, 52.6, false)]);
    await service.findMapPreview(5, 'en');
    expect(listSerializer.toArray).toHaveBeenCalledWith(expect.any(Array), TODAY, false, false, 'en');
  });
});

describe('listing cards carry the public location', () => {
  it('gives the list the same point the map uses, and hides a real one that is not public', async () => {
    const hidden = row(7, 36.7025, 52.6512, false);
    const visible = row(8, 36.71, 52.66, true);
    const { service, serializer } = setup([hidden, visible]);
    const map = await service.findMap({ bbox: '52,36,53,37', zoom: 14 } as any);

    const cards = await serializer.toArray(
      [hidden, visible].map((entry) => ({ ...entry, title: 'x' })) as unknown as PropertyJsonType[],
      TODAY,
      false,
      false,
      'fa',
    );
    for (const card of cards) {
      const pin = map.items.find((item: any) => item.id === card.id) as any;
      expect(card.public_location).toEqual(pin.location);
    }
    expect(cards.find((card) => card.id === 7).public_location).toMatchObject({ precision: 'approximate' });
    expect(cards.find((card) => card.id === 8).public_location).toMatchObject({ precision: 'exact' });
  });
});

describe('the map reads the same conditions as the list, for every kind of filter', () => {
  const rows = [row(1, 36.7, 52.6, true), row(2, 36.71, 52.61, false)];
  // The list narrows by ids twice over (the box, and a price range it resolves per day); what
  // has to match is every other condition.
  const withoutBoxNarrowing = (where: any) => {
    const rest = { ...(where ?? {}) };
    delete rest.id;
    return { ...rest, AND: (where?.AND ?? []).filter((entry: any) => !entry?.id?.in) };
  };

  const filters: Array<[string, Record<string, unknown>]> = [
    ['price range', { min_price: 1_000_000, max_price: 5_000_000 }],
    ['stay dates', { checkin: '2030-05-01', checkout: '2030-05-04' }],
    ['guests and rooms', { total_guests: 4, total_bedrooms: 2 }],
    ['city and neighbourhood', { cities: '5', regions: '9' }],
    ['province', { provinces: '3' }],
    ['amenity groups', { property_type: '1,2', welfare: '4', kitchen: '7', pool_type: '2' }],
    ['pool and discount', { has_pool: 1, has_discount: 1 }],
    ['text search', { q: 'ویلا' }],
  ];

  it.each(filters)('uses the list conditions for %s', async (_name, filter) => {
    const { service, db } = setup(rows);
    const box = '52,36,53,37';

    await service.findMap({ ...filter, bbox: box, zoom: 12 } as any);
    const mapWhere = db.property.findMany.mock.calls[0][0].where;
    db.property.findMany.mockClear();
    await service.findAll({ ...filter, bbox: box, page: 1, per_page: 30 } as any);
    // The list's first read is the same candidate read; its second is the page itself.
    const listCandidateWhere = db.property.findMany.mock.calls[0][0].where;
    const listPageWhere = db.property.findMany.mock.calls.at(-1)[0].where;

    expect(withoutBoxNarrowing(mapWhere)).toEqual(withoutBoxNarrowing(listCandidateWhere));
    expect(withoutBoxNarrowing(listPageWhere)).toEqual(withoutBoxNarrowing(mapWhere));
    expect(mapWhere.status).toBe(PropertyStatuses.PUBLISHED);
  });
});

describe('the map does not read once per listing', () => {
  const many = Array.from({ length: 120 }, (_, index) =>
    row(index + 1, 36.5 + index / 1000, 52.5 + index / 1000, index % 2 === 0),
  );

  it('answers the map, the histogram and the preview with a fixed number of reads', async () => {
    const { service, db } = setup(many);
    await service.findMap({ bbox: '52,36,53,37', zoom: 14 } as any);
    await service.findPriceHistogram({ bbox: '52,36,53,37' } as any);
    await service.findMapPreview(7, {} as any).catch(() => undefined);

    // One candidate read per request and at most one for the preview, whatever the row count.
    expect(db.property.findMany.mock.calls.length).toBeLessThanOrEqual(2);
    expect(db.property.findFirst.mock.calls.length).toBeLessThanOrEqual(1);
  });
});
