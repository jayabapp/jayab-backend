import { PropertyReserve, Property } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyUserService } from 'src/property/roles/user/user.service';
import { PropertyReserveUserService } from './user.service';
import { PropertyReserveOwnerService } from '../owner/owner.service';
import { PropertyReserveStatus } from '../../common/interfaces/property-reserve-status.type';

describe('guest reservation requests', () => {
  const db = {
    property: { findFirst: jest.fn() },
    propertyCalendar: { count: jest.fn() },
    propertyReserve: { create: jest.fn(), update: jest.fn() },
  };
  const quotes = { quote: jest.fn() };
  const service = new PropertyReserveUserService(
    db as unknown as PrismaService,
    null,
    null,
    null,
    quotes as unknown as PropertyUserService,
    null,
  );
  const dto = {
    property_id: 17,
    guests_count: '4',
    description: '',
    check_in: new Date(2026, 9, 6),
    check_out: new Date(2026, 11, 21),
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 1));
    jest.clearAllMocks();
    db.property.findFirst.mockResolvedValue({ id: 17, owner_id: 8 });
    db.propertyCalendar.count.mockResolvedValue(0);
    quotes.quote.mockResolvedValue({ stay_total: 298_100_000 });
    db.propertyReserve.create.mockImplementation(async ({ data }) => ({ id: 9, ...data }));
  });
  afterEach(() => jest.useRealTimers());

  it('persists a 76-night request using the server quote', async () => {
    const result = await service.create(dto, { id: 2, owner_id: null });
    expect(result).toMatchObject({
      created: true,
      ownerId: 8,
      reserve: { nights: 76, quoted_total: 298_100_000, status: PropertyReserveStatus.PENDING },
    });
    expect(quotes.quote).toHaveBeenCalledWith(17, {
      check_in: dto.check_in,
      check_out: dto.check_out,
      guests: 4,
    });
  });

  it('checks availability for the entire range before creating a long request', async () => {
    db.propertyCalendar.count.mockResolvedValue(1);
    await expect(service.create(dto, { id: 2, owner_id: null })).rejects.toThrow('RESERVE_DATES_UNAVAILABLE');
    expect(db.propertyCalendar.count).toHaveBeenCalledWith({
      where: { property_id: 17, is_reserved: true, date: { gte: dto.check_in, lt: dto.check_out } },
    });
    expect(db.propertyReserve.create).not.toHaveBeenCalled();
  });

  const reservation = (
    fields: Partial<PropertyReserve> = {},
  ): PropertyReserve & { property: Partial<Property> } =>
    ({
      id: 9,
      status: PropertyReserveStatus.PENDING,
      created_at: new Date(),
      owner_seen_at: null,
      owner_clicked_guest_mobile: 0,
      ...fields,
      property: { subscription_expired_at: new Date(2027, 0, 1), is_chat_enabled: false },
    }) as PropertyReserve & { property: Partial<Property> };

  it('keeps the guest waiting even if the owner merely opened the request card', async () => {
    for (const owner_seen_at of [null, new Date()]) {
      const result = await service.serializer(reservation({ owner_seen_at }));
      expect(result.status.title).toBe('در انتظار بررسی میزبان');
    }
  });

  it.each([false, true])(
    'shows seen after the call button is clicked (expired subscription: %s)',
    async (isExpired) => {
      const item = reservation();
      item.property.subscription_expired_at = new Date(isExpired ? 2025 : 2027, 0, 1);
      db.propertyReserve.update.mockImplementation(async ({ data }) => {
        if (data.owner_clicked_guest_mobile) item.owner_clicked_guest_mobile += 1;
        else Object.assign(item, data);
        return item;
      });
      const owner = new PropertyReserveOwnerService(
        db as unknown as PrismaService,
        null,
        {
          get: jest.fn().mockResolvedValue(null),
        } as never,
        null,
        null,
      );
      await owner.clickGuestMobile(item.id);
      const result = await service.serializer(item);
      expect(result.status.title).toBe('مشاهده شده توسط میزبان');
    },
  );

  it('shows the same seen title for existing contacted requests and preserves cancellation', async () => {
    const contacted = await service.serializer(reservation({ status: PropertyReserveStatus.OWNER_CALLED }));
    expect(contacted.status.title).toBe('مشاهده شده توسط میزبان');
    const canceled = await service.serializer(
      reservation({
        status: PropertyReserveStatus.CANCELED_BY_USER,
        owner_clicked_guest_mobile: 2,
      }),
    );
    expect(canceled.status.title).toBe('لغو شده توسط مهمان');
  });
});
