export type EffectivePriceDay = 'normal' | 'wednesday' | 'thursday' | 'friday' | 'peak';

type DailyPrice = Partial<Record<EffectivePriceDay, number>>;
type CalendarPrice = { effective_price?: number | null };

export type EffectivePriceCandidate = {
  id: number;
  daily_price?: DailyPrice | null;
  calendar?: CalendarPrice[] | null;
};

export function getEffectiveTodayPrice(
  property: EffectivePriceCandidate,
  today: EffectivePriceDay,
): number | null {
  return property.calendar?.[0]?.effective_price ?? property.daily_price?.[today] ?? null;
}

export function isEffectivePriceInRange(price: number | null, minPrice?: number, maxPrice?: number): boolean {
  if (price === null) return false;
  if (minPrice !== undefined && price < minPrice) return false;
  if (maxPrice !== undefined && price > maxPrice) return false;
  return true;
}

export type TodayPrice = {
  price: number;
  discounted_price: number | null;
  discount_percentage: number | null;
};

type TodayCalendarPrice = {
  price?: number | null;
  effective_price?: number | null;
  discounted_price?: number | null;
  discount_percentage?: number | null;
};

export function resolveTodayPrice(
  calendar: TodayCalendarPrice | null | undefined,
  today: EffectivePriceDay,
  dailyPrice: DailyPrice | null | undefined,
): TodayPrice {
  if (calendar?.effective_price)
    return {
      price: calendar.price,
      discounted_price: calendar.discounted_price ?? null,
      discount_percentage: calendar.discount_percentage ?? null,
    };
  return { price: dailyPrice?.[today], discounted_price: null, discount_percentage: null };
}

export function resolveDisplayPrice(
  todayPrice: Pick<TodayPrice, 'price' | 'discounted_price'>,
): number | null {
  const value = todayPrice.discounted_price ?? todayPrice.price;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}
