import { EnumList } from 'src/common/interfaces/model-props.interface';

export enum NotificationSourceFilter {
  ADMIN = 'admin',
  SYSTEM = 'system',
  ALL = 'all',
}

export const NotificationSourceFilterList = [
  { id: NotificationSourceFilter.ADMIN, title: 'ارسال توسط ادمین' },
  { id: NotificationSourceFilter.SYSTEM, title: 'پیام سیستمی' },
  { id: NotificationSourceFilter.ALL, title: 'همه پیام‌ها' },
];

export const NotificationSourceList: EnumList[] = [
  { id: true, title: 'توسط ادمین', hex: '#0ea5e9' },
  { id: false, title: 'سیستمی', hex: '#84cc16' },
];
