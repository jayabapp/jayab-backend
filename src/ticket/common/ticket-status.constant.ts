import { EnumList } from 'src/common/interfaces/model-props.interface';

export enum TicketCommonStatuses {
  WAITING = 1,
  REPLIED = 2,
  CLOSED = 3,
}

export const TicketStatusList: EnumList[] = [
  { id: TicketCommonStatuses.WAITING, title: 'منتظر پاسخ', hex: '#facc15' },
  { id: TicketCommonStatuses.REPLIED, title: 'پاسخ داده شده', hex: '#14b8a6' },
  { id: TicketCommonStatuses.CLOSED, title: 'بسته شده', hex: '#4f46e5' },
];
