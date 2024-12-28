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

export enum OwnerStatus {
  PENDING = 10,
  APPROVED = 20,
  AUTO_CHECK_SERVICE_ERROR = 90,
  REJECTED = 100,
}

export const OwnerStatusList: Array<EnumList> = [
  {
    id: OwnerStatus.PENDING,
    title: 'در انتظار بررسی',
    hex: '#eab308',
  },
  {
    id: OwnerStatus.APPROVED,
    title: 'تایید شده',
    hex: '#84cc16',
  },
  {
    id: OwnerStatus.AUTO_CHECK_SERVICE_ERROR,
    title: 'خطا در بررسی اتوماتیک',
    hex: '#f97316',
  },
  {
    id: OwnerStatus.REJECTED,
    title: 'تایید نشده',
    hex: '#be123c',
  },
];

/* -------------------------------------------------------------------------- */
