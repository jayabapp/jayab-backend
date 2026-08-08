export enum PaymentGatewayEnum {
  SANDBOX = 'SANDBOX',
  ZARINPAL = 'ZARINPAL',
  BAZAARPAY = 'BAZAARPAY',
  SEP = 'SEP',
  MELLAT = 'MELLAT',
}

export type PaymentGatewayParams = { title: string; key: string; value?: string };
