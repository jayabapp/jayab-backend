import { Prisma, PrismaClient } from '@prisma/client';
// import { PaymentMethodEnum } from '../../src/payment-method/common/payment-method.enum';
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                    SEED                                    */
/* -------------------------------------------------------------------------- */
// const methods = (): Prisma.PaymentMethodCreateInput[] => {
//   const data: Prisma.PaymentMethodCreateInput[] = [
//     {
//       title: 'آنلاین',
//       key: PaymentMethodEnum.ONLINE,
//       percentage_increase: 0,
//       is_active: true,
//     },
//   ];

//   return data;
// };

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export async function paymentMethodSeeder(): Promise<void> {
  console.time('✅ PAYMENT METHOD');
  // for (const e of methods()) {
  //   const method = await prisma.paymentMethod.findFirst({ where: { key: e.key } });
  //   if (!method) await prisma.paymentMethod.create({ data: e });
  // }
  console.timeEnd('✅ PAYMENT METHOD');
}
