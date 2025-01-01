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

export enum CancelingType {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  STRICT = 'STRICT',
}

export const CancelingTypeList: Array<EnumList> = [
  {
    id: CancelingType.EASY,
    title: 'سهل گیرانه',
    hex: '#84cc16',
  },
  {
    id: CancelingType.NORMAL,
    title: 'متعادل',
    hex: '#eab308',
  },
  {
    id: CancelingType.STRICT,
    title: 'سخت گیرانه',
    hex: '#be123c ',
  },
];
