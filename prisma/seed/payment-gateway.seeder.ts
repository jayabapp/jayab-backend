import { Prisma, PrismaClient } from '@prisma/client';
import { PaymentGatewayEnum } from 'src/payment-gateway/common/payment-gateway.enum';
// import { PaymentGatewayEnum } from '../../src/payment-gateway/common/payment-gateway.enum';
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                    SEED                                    */
/* -------------------------------------------------------------------------- */
export const gateways = (): Prisma.PaymentGatewayCreateInput[] => {
  const data: Prisma.PaymentGatewayCreateInput[] = [
    {
      title: 'سندباکس (تست)',
      key: PaymentGatewayEnum.SANDBOX,
      logo: '',
      is_active: true,
      params: [],
    },
    {
      title: 'زرین پال',
      key: PaymentGatewayEnum.ZARINPAL,
      logo: 'https://kian-dev-bucket.storage.iran.liara.space/banks/zarinpal.png',
      is_active: false,
      params: [
        {
          title: 'مرچنت کد',
          key: 'merchant',
          value: '',
        },
      ],
    },
    {
      title: 'بازارپی',
      key: PaymentGatewayEnum.BAZAARPAY,
      logo: '',
      is_active: false,
      params: [
        {
          title: 'نام پذیرنده',
          key: 'destination',
          value: '',
        },
        {
          title: 'نام سرویس',
          key: 'service_name',
          value: 'خرید اشتراک جایاب',
        },
        {
          title: 'توکن احراز هویت',
          key: 'authorization_token',
          value: '',
        },
      ],
    },
    // {
    //   title: 'بانک سامان',
    //   key: PaymentGatewayEnum.SEP,
    //   logo: 'https://kian-dev-bucket.storage.iran.liara.space/banks/saman.png',
    //   is_active: false,
    //   params: [
    //     {
    //       title: 'شناسه ترمینال',
    //       key: 'terminalId',
    //       value: '',
    //     },
    //   ],
    // },
    // {
    //   title: 'بانک ملت',
    //   key: PaymentGatewayEnum.MELLAT,
    //   logo: 'https://kian-dev-bucket.storage.iran.liara.space/banks/mellat.png',
    //   is_active: false,
    //   params: [
    //     {
    //       title: 'شناسه ترمینال',
    //       key: 'terminalId',
    //       value: '',
    //     },
    //     {
    //       title: 'نام کاربری',
    //       key: 'username',
    //       value: '',
    //     },
    //     {
    //       title: 'رمز عبور',
    //       key: 'password',
    //       value: '',
    //     },
    //   ],
    // },
  ];

  return data;
};

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export async function paymentGatewaySeeder(): Promise<void> {
  console.time('✅ PAYMENT GATEWAY');
  for (const e of gateways()) {
    await prisma.paymentGateway.upsert({ where: { key: e.key }, update: {}, create: e });
  }
  console.timeEnd('✅ PAYMENT GATEWAY');
}
