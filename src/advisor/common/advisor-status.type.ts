import { EnumList } from 'src/common/interfaces/model-props.interface';

/** COLORS LIST
 *
 * #0ea5e9
 * #eab308
 * #84cc16
 * #14b8a6
 * #be123c
 * #f97316
 */

export enum AdvisorStatus {
  PENDING = 10,
  APPROVED = 20,
  REJECTED = 100,
}

export const AdvisorStatusList: Array<EnumList> = [
  {
    id: AdvisorStatus.PENDING,
    title: 'در انتظار بررسی',
    hex: '#eab308',
  },
  {
    id: AdvisorStatus.APPROVED,
    title: 'تایید شده',
    hex: '#84cc16',
  },
  {
    id: AdvisorStatus.REJECTED,
    title: 'تایید نشده',
    hex: '#be123c',
  },
];

/* -------------------------------------------------------------------------- */
