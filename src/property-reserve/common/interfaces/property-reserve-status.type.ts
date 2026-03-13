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
}

export const PropertyReserveStatusList: Array<EnumList> = [
  {
    id: PropertyReserveStatus.PENDING,
    title: 'در انتظار بررسی مالک',
    hex: '#eab308',
  },
  {
    id: PropertyReserveStatus.CANCELED_BY_USER,
    title: 'لغو شده توسط مهمان',
    hex: '#f43f5e',
  },
];
