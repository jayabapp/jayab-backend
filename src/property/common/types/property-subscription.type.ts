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

export enum PropertySubscription {
  WAITING = 10,
  SUCCESS = 20,
  FAILED = 100,
}

export const PropertySubscriptionList: Array<EnumList> = [
  {
    id: PropertySubscription.WAITING,
    title: 'در انتظار پرداخت',
    hex: '#f97316',
  },
  {
    id: PropertySubscription.SUCCESS,
    title: 'پرداخت شده',
    hex: '#22c55e',
  },
  {
    id: PropertySubscription.FAILED,
    title: 'خطا در پرداخت',
    hex: '#be123c ',
  },
];
