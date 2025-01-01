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

export enum RentType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}
export const RentTypeList: Array<EnumList> = [
  {
    id: RentType.HOURLY,
    title: 'ساعتی',
    hex: '#0ea5e9',
  },
  {
    id: RentType.HOURLY,
    title: 'روزانه',
    hex: '#14b8a6',
  },
  {
    id: RentType.DAILY,
    title: 'ماهانه',
    hex: '#eab308 ',
  },
  {
    id: RentType.MONTHLY,
    title: 'سالانه',
    hex: '#f97316',
  },
];
