import { EnumList } from 'src/common/interfaces/model-props.interface';

export enum PaymentStatuses {
  INIT = 10,
  PENDING = 20,
  APPROVED = 30,
  FAILED = 40,
}

export const PaymentStatusesList: Array<EnumList> = [
  {
    id: PaymentStatuses.INIT,
    title: 'ثبت اولیه',
    hex: '#0284c7',
  },
  {
    id: PaymentStatuses.PENDING,
    title: 'در حال پرداخت',
    hex: '#eab308',
  },
  {
    id: PaymentStatuses.APPROVED,
    title: 'پرداخت شده',
    hex: '#84cc16',
  },
  {
    id: PaymentStatuses.FAILED,
    title: 'پرداخت نشده',
    hex: '#dc2626',
  },
];
