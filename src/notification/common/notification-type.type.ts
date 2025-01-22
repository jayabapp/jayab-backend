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

export enum NotificationType {
  MOBILE = 1,
  GROUP = 2,
}

export const NotificationTypeList: Array<EnumList> = [
  {
    id: NotificationType.MOBILE,
    title: 'ارسال به موبایل',
    hex: '#eab308',
  },
  {
    id: NotificationType.GROUP,
    title: 'ارسال به گروه',
    hex: '#84cc16',
  },
];
