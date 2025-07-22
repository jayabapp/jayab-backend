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

export enum PropertyStatuses {
  INIT = 10,
  IN_PROCESS = 15,
  WAITING = 20,
  REJECTED = 25,
  PUBLISHED = 30,
  EDITED = 31,
  DELETED = 60,
}

export const PropertyStatusesList: Array<EnumList> = [
  {
    id: PropertyStatuses.INIT,
    title: 'ثبت اولیه',
    hex: '#0ea5e9',
  },
  {
    id: PropertyStatuses.IN_PROCESS,
    title: 'در حال ثبت',
    hex: '#14b8a6',
  },
  {
    id: PropertyStatuses.WAITING,
    title: 'در انتظار تایید کارشناس جایاب',
    hex: '#eab308',
  },
  {
    id: PropertyStatuses.PUBLISHED,
    title: 'منتشر شده',
    hex: '#22c55e',
  },
  {
    id: PropertyStatuses.EDITED,
    title: 'در حال بررسی مجدد',
    hex: '#f59e0b',
  },
  {
    id: PropertyStatuses.REJECTED,
    title: 'تایید نشده',
    hex: '#be123c',
  },
  {
    id: PropertyStatuses.DELETED,
    title: 'حذف شده توسط مالک',
    hex: '#f43f5e',
  },
];

/* -------------------------------------------------------------------------- */

/*  */
export const InProgressReserveStatus = [PropertyStatuses.INIT, PropertyStatuses.IN_PROCESS];
// export const CompletedReserveStatus = [PropertyStatuses.FINISHED, PropertyStatuses.WAITING_FOR_REVIEW];
// export const CanceledReserveStatus = [PropertyStatuses.CANCELED_BY_MANAGER];

export const CannotBuySubscriptionStatuses = [
  PropertyStatuses.INIT,
  PropertyStatuses.IN_PROCESS,
  PropertyStatuses.WAITING,
];

/*  */
// export const TotalReserveStatus = [
//   PropertyStatuses.PENDING,
//   PropertyStatuses.RESERVED,
//   PropertyStatuses.CANCELED_BY_MANAGER,
//   PropertyStatuses.WAITING_FOR_REVIEW,
//   PropertyStatuses.FINISHED,
// ];
