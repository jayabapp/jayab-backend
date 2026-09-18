import { DayColumn } from 'src/common/helpers/day.helper';

type NightCalendarEntry = {
  price?: number | null;
  discounted_price?: number | null;
};

type NightDailyPrice = Partial<Record<DayColumn, number>> | null | undefined;

export type NightPrice = {
  base: number;
  final: number;
  discounted: boolean;
};

export function resolveNightPrice(
  calendarEntry: NightCalendarEntry | null | undefined,
  dailyPrice: NightDailyPrice,
  column: DayColumn,
): NightPrice {
  const base = calendarEntry?.price ?? dailyPrice?.[column] ?? 0;
  const final = calendarEntry?.discounted_price ?? base;
  return { base, final, discounted: calendarEntry?.discounted_price != null };
}
