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

export enum FirebaseTopicType {
  USER = 'USER',
  OWNER = 'OWNER',
  ADVISOR = 'ADVISOR',
  TEST = 'TEST',
}

export const FirebaseTopicTypeList: Array<EnumList> = [
  {
    id: FirebaseTopicType.USER,
    title: 'همه کاربران',
    hex: '#eab308',
  },
  {
    id: FirebaseTopicType.OWNER,
    title: 'مالکان',
    hex: '#84cc16',
  },
  {
    id: FirebaseTopicType.ADVISOR,
    title: 'مشاوران',
    hex: '#0ea5e9',
  },
  {
    id: FirebaseTopicType.TEST,
    title: 'تست',
    hex: '#be123c',
  },
];
