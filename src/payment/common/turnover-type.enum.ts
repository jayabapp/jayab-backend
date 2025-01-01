import { EnumList } from 'src/common/interfaces/model-props.interface';

export enum TurnoverType {
  COMMISSION = 'COMMISSION',

  GATEWAY_PAYMENT = 'GATEWAY_PAYMENT',

  PAY_SUBSCRIPTION = 'PAY_SUBSCRIPTION',

  PAY_RESERVE = 'PAY_RESERVE',
  PAY_RESERVE_BY_WALLET = 'PAY_RESERVE_BY_WALLET',

  PAY_ORDER = 'PAY_ORDER',
  PAY_ORDER_BY_WALLET = 'PAY_ORDER_BY_WALLET',

  PAY_TO_BUSINESS = 'PAY_TO_BUSINESS',
  FOR_BUSINESS = 'FOR_BUSINESS',

  PAY_TO_WALLET = 'PAY_TO_WALLET',
  WITHDRAW_FROM_WALLET = 'WITHDRAW_FROM_WALLET',

  CHARGE_CREDIT = 'CHARGE_CREDIT',
}

export const TurnoverTypeList: Array<EnumList> = [
  {
    id: TurnoverType.COMMISSION,
    title: 'کمیسیون',
    hex: '#1dbbaa',
  },
  {
    id: TurnoverType.GATEWAY_PAYMENT,
    title: 'درگاه پرداخت',
    hex: '#1d4ed8',
  },
  {
    id: TurnoverType.PAY_RESERVE,
    title: 'پرداخت مبلغ رزرو از درگاه',
    hex: '#eab308',
  },
  {
    id: TurnoverType.PAY_RESERVE_BY_WALLET,
    title: 'پرداخت مبلغ رزرو از کیف پول',
    hex: '#0369a1',
  },
  {
    id: TurnoverType.PAY_ORDER,
    title: 'پرداخت مبلغ سفارش از درگاه',
    hex: '#be123c',
  },
  {
    id: TurnoverType.PAY_ORDER_BY_WALLET,
    title: 'پرداخت مبلغ سفارش از کیف پول',
    hex: '#be123c',
  },
  {
    id: TurnoverType.PAY_TO_BUSINESS,
    title: 'پرداخت مبلغ به فروشگاه',
    hex: '#84cc16',
  },
  {
    id: TurnoverType.FOR_BUSINESS,
    title: 'شارژ حساب فروشگاه',
    hex: '#aabb45',
  },
  {
    id: TurnoverType.PAY_TO_WALLET,
    title: 'پرداخت به کیف پول',
    hex: '#ffbb44',
  },
  {
    id: TurnoverType.WITHDRAW_FROM_WALLET,
    title: 'برادشت از کیف پول',
    hex: '#a9a9a9',
  },
];
