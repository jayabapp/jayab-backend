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

export enum PropertyBadgeStatus {
  PENDING = 20,
  IN_PROCESS = 30,
  REJECTED = 90,
  APPROVED = 100,
}

export const PropertyBadgeStatusList: Array<EnumList> = [
  {
    id: PropertyBadgeStatus.PENDING,
    title: 'در انتظار تایید کارشناس جایاب',
    hex: '#eab308',
  },
  {
    id: PropertyBadgeStatus.IN_PROCESS,
    title: 'در حال انجام',
    hex: '#f97316',
  },
  {
    id: PropertyBadgeStatus.APPROVED,
    title: 'تایید شده',
    hex: '#22c55e',
  },
  {
    id: PropertyBadgeStatus.REJECTED,
    title: 'تایید نشده',
    hex: '#be123c',
  },
];
