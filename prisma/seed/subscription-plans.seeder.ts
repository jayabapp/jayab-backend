import { type Prisma, PrismaClient } from '@prisma/client';
import {
  SubscriptionPlanGroup,
  SubscriptionPlanGroupList,
} from 'src/subscription-plan/common/subscription-plan-group.type';
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                    SEED                                    */
/* -------------------------------------------------------------------------- */
const data = (): Prisma.SubscriptionPlanCreateInput => {
  const data: Prisma.SubscriptionPlanCreateInput = {
    duration: 30,
    title: 'اشتراک ۳۰ روزه',
    group: SubscriptionPlanGroup.PROPERTY,
    price: 100_000,
    price_with_discount: 90000,
    is_active: true,
  };
  return data;
};

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export async function subscriptionPlanSeeder(): Promise<void> {
  console.time('✅ SUBSCRIPTION PLAN');
  const item = await prisma.subscriptionPlan.findFirst({ where: { title: data().title } });
  if (!item) await prisma.subscriptionPlan.create({ data: data() });

  console.timeEnd('✅ SUBSCRIPTION PLAN');
}
