import { PropertyUserController } from './user.controller';

const routePath = (method: string): string =>
  Reflect.getMetadata('path', PropertyUserController.prototype[method]);

describe('property user routes', () => {
  it('declares the fixed map routes before the slug route, so they are not read as a slug', () => {
    const order = Object.getOwnPropertyNames(PropertyUserController.prototype).filter((name) => {
      try {
        return routePath(name) !== undefined;
      } catch {
        return false;
      }
    });

    const slug = order.findIndex((name) => routePath(name) === ':propertySlug');
    const map = order.findIndex((name) => routePath(name) === 'map');
    const histogram = order.findIndex((name) => routePath(name) === 'price-histogram');

    expect(slug).toBeGreaterThan(-1);
    expect(map).toBeGreaterThan(-1);
    expect(histogram).toBeGreaterThan(-1);
    expect(map).toBeLessThan(slug);
    expect(histogram).toBeLessThan(slug);
    expect(routePath('findMapPreview')).toBe(':propertyId/map-preview');
  });
});

describe('impressions', () => {
  const build = () => {
    const viewQueue = { add: jest.fn() };
    const callLogQueue = { add: jest.fn() };
    const service = {
      findAll: jest.fn(async () => ({ data: [{ id: 1 }, { id: 2 }], meta: {} })),
      findMap: jest.fn(async () => ({ items: [], meta: {} })),
      findPriceHistogram: jest.fn(async () => ({ bins: [] })),
      findMapPreview: jest.fn(async () => ({ id: 1 })),
    };
    const profile = { checkUserIsActiveAdvisor: jest.fn(async () => ({ isAdvisor: false })) };
    const controller = new PropertyUserController(
      callLogQueue as any,
      viewQueue as any,
      service as any,
      profile as any,
      null,
    );
    return { controller, viewQueue };
  };

  it('records a view for a normal list request', async () => {
    const { controller, viewQueue } = build();
    await controller.findAll({} as any);
    expect(viewQueue.add).toHaveBeenCalledWith(expect.anything(), { propertyIds: [1, 2] });
  });

  it('records nothing for a count-only list request', async () => {
    const { controller, viewQueue } = build();
    await controller.findAll({ count_only: 1 } as any);
    expect(viewQueue.add).not.toHaveBeenCalled();
  });

  it('records nothing for the map, the histogram or the preview', async () => {
    const { controller, viewQueue } = build();
    await controller.findMap({ bbox: '1,2,3,4', zoom: 5 } as any);
    await controller.findPriceHistogram({} as any);
    await controller.findMapPreview(1, {} as any);
    expect(viewQueue.add).not.toHaveBeenCalled();
  });
});
