import { DayColumn } from 'src/common/helpers/day.helper';
import { startOfToday } from 'src/common/helpers/date.helper';

type CalendarPrice = {
  date: Date;
  is_reserved: boolean;
  price?: number | null;
  discounted_price?: number | null;
};

/** Lowest nightly rate; record identifiers and extra fees are never rent. */
export function findMinimumNightlyPrice(
  dailyPrice: Partial<Record<DayColumn, number>> | null | undefined,
  calendar: readonly CalendarPrice[] = [],
  fromDate: Date = startOfToday(),
): number | null {
  const dailyValues = Object.values(DayColumn).map((column) => dailyPrice?.[column]);
  const calendarValues = calendar
    .filter((entry) => !entry.is_reserved && entry.date >= fromDate)
    .map((entry) => entry.discounted_price ?? entry.price);
  const candidates = [...dailyValues, ...calendarValues].filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0,
  );
  return candidates.length ? Math.min(...candidates) : null;
}
