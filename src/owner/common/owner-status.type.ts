import { EnumList } from 'src/common/interfaces/model-props.interface';

/** COLORS LIST
 *
 * #0ea5e9
 * #eab308
 * #84cc16
 * #14b8a6
 * #be123c
 */

export enum OwnerStatus {
  PENDING = 10,
  NOT_APPROVED = 20,
  APPROVED = 100,
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
    id: OwnerStatus.NOT_APPROVED,
    title: 'رد شده',
    hex: '#be123c',
  },
];

/* -------------------------------------------------------------------------- */
