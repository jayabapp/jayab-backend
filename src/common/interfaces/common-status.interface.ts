import { EnumList } from './model-props.interface';

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

export enum CommonStatuses {
  INIT = 10,
  IN_PROCESS = 20,
  PENDING = 30,
  APPROVED = 40,
  REJECTED = 50,
  REJECTED_BY_ADMIN = 51,
  REJECTED_BY_USER = 52,
  FAILED = 60,
  COMPLETED = 90,
  FINISHED = 100,
}

export const CommentStatusesList: Array<EnumList> = [
  {
    id: CommonStatuses.PENDING,
    title: 'در حال بررسی',
    hex: '#eab308',
  },
  {
    id: CommonStatuses.APPROVED,
    title: 'تایید شده',
    hex: '#84cc16',
  },
  {
    id: CommonStatuses.REJECTED,
    title: 'رد شده',
    hex: '#be123c',
  },
];
