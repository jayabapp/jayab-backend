import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyUserService } from './user.service';
import moment from 'moment-jalaali';

describe('property quotes for long stays', () => {
  const checkIn = new Date(2026, 9, 6);
  const checkOut = new Date(2026, 11, 21);
  const after = (days: number): Date => moment(checkIn).add(days, 'days').toDate();
  const db = {
    property: { findFirst: jest.fn() },
    propertyCalendar: { findMany: jest.fn() },
    peakDay: { findMany: jest.fn() },
  };
  const service = new PropertyUserService(null, db as unknown as PrismaService, null, null, null, null, null);
  const dto = { check_in: checkIn, check_out: checkOut, guests: 4 };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 1));
    jest.clearAllMocks();
    db.property.findFirst.mockResolvedValue({
      id: 17,
      std_capacity: 2,
      max_capacity: 4,
      daily_price: {
        normal: 3_500_000,
        wednesday: 3_500_000,
        thursday: 3_500_000,
        friday: 3_500_000,
        peak: 6_000_000,
        additional_person: 200_000,
        cleaning: 300_000,
      },
    });
    db.propertyCalendar.findMany.mockResolvedValue([
      { date: after(20), price: 4_500_000, discounted_price: 2_700_000, is_reserved: false },
    ]);
    db.peakDay.findMany.mockResolvedValue([{ date: after(40) }]);
  });
  afterEach(() => jest.useRealTimers());

  it('prices all 76 nights including later discounts, peak dates and extra guests', async () => {
    const quote = await service.quote(17, dto);
    const rent = 74 * 3_500_000 + 2_700_000 + 6_000_000;
    const extraGuests = 2 * 200_000 * 76;
    expect(quote).toMatchObject({
      nights: 76,
      rent_total: rent,
      discount_total: 1_800_000,
      extra_guest_total: extraGuests,
      cleaning_fee: 300_000,
      stay_total: rent + extraGuests,
      total: rent + extraGuests,
      is_available: true,
    });
    expect(quote.nights_breakdown).toHaveLength(76);
    expect(quote.nights_breakdown[20]).toMatchObject({ final_price: 2_700_000, is_discounted: true });
    expect(quote.nights_breakdown[40]).toMatchObject({ final_price: 6_000_000, is_peak: true });
    expect(quote.nights_breakdown.reduce((sum, night) => sum + night.final_price, 0)).toBe(rent);
    expect(db.propertyCalendar.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { property_id: 17, date: { gte: checkIn, lt: checkOut } },
      }),
    );
  });

  it('detects unavailable nights after the old 15-night cutoff', async () => {
    db.propertyCalendar.findMany.mockResolvedValue([
      { date: after(50), price: 3_500_000, is_reserved: true },
    ]);
    const quote = await service.quote(17, dto);
    expect(quote.is_available).toBe(false);
    expect(quote.unavailable_dates).toEqual([moment(after(50)).format('YYYY-MM-DD')]);
  });

  it.each([
    [checkIn, checkIn, 'RESERVE1'],
    [checkOut, checkIn, 'RESERVE2'],
    [new Date(2026, 8, 1), checkOut, 'RESERVE3'],
  ])('still rejects invalid ranges', async (start: Date, end: Date, code: string) => {
    await expect(service.quote(17, { ...dto, check_in: start, check_out: end })).rejects.toThrow(code);
  });
});
