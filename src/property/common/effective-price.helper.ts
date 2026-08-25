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
