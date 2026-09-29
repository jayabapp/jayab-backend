import { EnumList } from 'src/common/interfaces/model-props.interface';

/** COLORS LIST
 *
 * #0ea5e9
 * #eab308
 * #84cc16
 * #14b8a6
 * #be123c
 * #f97316
 * #9333ea
 * #3b82f6
 * #22c55e
 * #ec4899
 * #f43f5e
 * #f59e0b
 * #10b981
 * #6366f1
 * #22d3ee
 */

export enum PropertyReserveStatus {
  PENDING = 10,
  CANCELED_BY_USER = 20,
  OWNER_CALLED = 30,
}

export const PropertyReserveStatusList: Array<EnumList> = [
  {
    id: PropertyReserveStatus.PENDING,
    title: 'در انتظار بررسی میزبان',
    hex: '#f59e0b',
  },
  {
    id: PropertyReserveStatus.CANCELED_BY_USER,
    title: 'لغو شده توسط مهمان',
    hex: '#f43f5e',
  },
  {
    id: PropertyReserveStatus.OWNER_CALLED,
    title: 'مشاهده شده توسط میزبان',
    hex: '#10b981',
  },
];

export const PropertyReserveGuestStatusTitle: Record<number, string> = {
  [PropertyReserveStatus.PENDING]: 'ارسال‌شده برای میزبان',
  [PropertyReserveStatus.OWNER_CALLED]: 'میزبان تماس گرفت',
};

// Overrides PENDING's guest-facing title once the host has actually opened the
// request (owner_seen_at set) but hasn't called yet — "seen" and "called" are
// distinct events and must not collapse into one label.
export const PropertyReserveGuestSeenTitle = 'مشاهده شده توسط میزبان';
