import { EnumList } from './model-props.interface';

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
