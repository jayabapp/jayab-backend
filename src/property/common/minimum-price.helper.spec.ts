import { PropertyDailyPrice } from '@prisma/client';
import { findMinimumNightlyPrice } from './minimum-price.helper';

const from = new Date('2026-10-13');
const dailyPrice = {
  id: 3,
  property_id: 17,
  normal: 2700000,
  wednesday: 3000000,
  thursday: 4000000,
  friday: 3650000,
  peak: 5000000,
  cleaning: 150000,
  additional_person: 200000,
  today_offer: 10,
} as PropertyDailyPrice;

describe('minimum nightly price', () => {
  it('excludes IDs, extra fees and offer metadata from the starting price', () => {
    expect(findMinimumNightlyPrice(dailyPrice, [], from)).toBe(2700000);
  });

  it('includes a future discounted rate beyond the next week', () => {
    expect(
      findMinimumNightlyPrice(
        dailyPrice,
        [{ date: new Date('2026-11-01'), is_reserved: false, price: 3000000, discounted_price: 2500000 }],
        from,
      ),
    ).toBe(2500000);
  });

  it('excludes past and reserved prices and accepts an undiscounted price today', () => {
    expect(
      findMinimumNightlyPrice(
        dailyPrice,
        [
          { date: new Date('2026-10-12'), is_reserved: false, price: 100000 },
          { date: from, is_reserved: true, discounted_price: 200000 },
          { date: from, is_reserved: false, price: 2600000, discounted_price: null },
        ],
        from,
      ),
    ).toBe(2600000);
  });

  it('returns null when no positive nightly rate exists', () => {
    expect(findMinimumNightlyPrice(null, [], from)).toBeNull();
    expect(findMinimumNightlyPrice({ normal: 0, friday: -1, peak: NaN }, [], from)).toBeNull();
  });
});
