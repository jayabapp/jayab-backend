import { type Prisma, PrismaClient } from '@prisma/client';
import {
  SubscriptionPlanGroup,
  SubscriptionPlanGroupList,
} from 'src/subscription-plan/common/subscription-plan-group.type';
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                    SEED                                    */
/* -------------------------------------------------------------------------- */
const data = (): Prisma.SubscriptionPlanCreateInput[] => {
  const data: Prisma.SubscriptionPlanCreateInput[] = [
    {
      duration: 30,
      title: 'اشتراک ۳۰ روزه',
      group: SubscriptionPlanGroup.PROPERTY,
      price: 100_000,
      price_with_discount: 90000,
      is_active: true,
    },
    {
      duration: 0,
      title: 'نردبان',
      group: SubscriptionPlanGroup.PROPERTY,
      price: 100_000,
      description:
        'با نردبان آگهی ملک شما در بالای لیست ملک ها قرار میگیرد و به عنوان اولین آگهی در آن شهر و استان نمایش داده میشود.',
      is_promote: true,
      is_active: true,
    },
    /* -------------------------------------------------------------------------- */
    {
      duration: 30,
      title: 'اشتراک عادی',
      group: SubscriptionPlanGroup.ADVISOR,
      price: 100_000,
      price_with_discount: 90000,
      is_active: true,
      description: `با پرداخت هزینه ماهانه ۱۰۰۰۰۰ ریال امکانات زیر برای شما فعال میگردد:
۱. مشاهده درصد کمیسیون مالکین
۲. مشاهده روزهای خالی ملک
۳. امکان اشتراک گذاری اطلاعات ملک`,
    },
    {
      duration: 30,
      title: 'اشتراک ویژه',
      group: SubscriptionPlanGroup.ADVISOR,
      price: 1_000_000,
      is_special: true,
      description: `با پرداخت هزینه ماهانه ۱۰۰۰۰۰۰ ریال امکانات زیر برای شما فعال میگردد:
۱. مشاهده درصد کمیسیون مالکین
۲. مشاهده روزهای خالی ملک
۳. امکان اشتراک گذاری اطلاعات ملک`,
      is_active: true,
    },
  ];
  return data;
};

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export async function subscriptionPlanSeeder(): Promise<void> {
  console.time('✅ SUBSCRIPTION PLAN');
  for (const e of data()) {
    const item = await prisma.subscriptionPlan.findFirst({ where: { title: e.title } });
    if (!item) await prisma.subscriptionPlan.create({ data: e });
  }

  console.timeEnd('✅ SUBSCRIPTION PLAN');
}
