import { Prisma, PrismaClient } from '@prisma/client';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';
// import { PaymentGatewayEnum } from '../../src/payment-gateway/common/payment-gateway.enum';
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                    SEED                                    */
/* -------------------------------------------------------------------------- */
const data = (): Prisma.PropertyOptionCreateInput[] => {
  const options: Prisma.PropertyOptionCreateInput[] = [
    { title: 'بیلیارد', group: PropertyOptionGroup.ENTERTAINMENT, key: 'billiard' },
    { title: 'فوتبال دستی', group: PropertyOptionGroup.ENTERTAINMENT },
    { title: 'مجرد', group: PropertyOptionGroup.GUEST_TYPE },
    { title: 'متاهل', group: PropertyOptionGroup.GUEST_TYPE },
    { title: 'استخرد روباز', group: PropertyOptionGroup.POOL_TYPE },
    { title: 'استخر آب گرم', group: PropertyOptionGroup.POOL_TYPE },
    { title: 'ویلا', group: PropertyOptionGroup.PROPERTY_TYPE, key: 'vila' },
    { title: 'سوئیت', group: PropertyOptionGroup.PROPERTY_TYPE, key: 'suite' },
    { title: 'آپارتمان', group: PropertyOptionGroup.PROPERTY_TYPE, key: 'apartment' },
    { title: 'کلبه', group: PropertyOptionGroup.PROPERTY_TYPE, key: 'cottage' },
    { title: 'خانه روستایی', group: PropertyOptionGroup.PROPERTY_TYPE, key: 'ruralhome' },
    { title: 'بومگـردی', group: PropertyOptionGroup.PROPERTY_TYPE, key: 'ecolog' },
    { title: 'جاده کوهستانی', group: PropertyOptionGroup.ACCESS },
    { title: 'جنگلی', group: PropertyOptionGroup.PATTERN, key: 'forest' },
    { title: 'ساحلی', group: PropertyOptionGroup.PATTERN, key: 'beach' },
    { title: 'کوهستانی', group: PropertyOptionGroup.PATTERN, key: 'mountain' },
    { title: 'مرکز خرید', group: PropertyOptionGroup.NEIGHBORHOOD },
    { title: 'یخچال', group: PropertyOptionGroup.KITCHEN },
    { title: 'مایکروفر', group: PropertyOptionGroup.KITCHEN },
    { title: 'کولر گازی', group: PropertyOptionGroup.COOL_HEAT },
    { title: 'کولر آبی', group: PropertyOptionGroup.COOL_HEAT },
    { title: 'آلاچیق', group: PropertyOptionGroup.WELFARE },
    { title: 'تلویزیون', group: PropertyOptionGroup.WELFARE },
    { title: 'مجاز نیست', group: PropertyOptionGroup.PET },
    { title: 'فقط داخل فضای باز مجاز است', group: PropertyOptionGroup.PET },
    { title: 'مجاز است بدون نیاز به هماهنگی', group: PropertyOptionGroup.PARTY },
    { title: 'مجاز است ولی نیاز به هماهنگی دارد', group: PropertyOptionGroup.PARTY },
    { title: 'شمالی', group: PropertyOptionGroup.BUILDING_DIRECTION },
    {
      title: 'دربست',
      description: 'این ملک دربست است و تمامی فضاها در اختیار مهمان قرار دارد',
      group: PropertyOptionGroup.OWNERSHIP,
    },
    {
      title: 'غیر دربست',
      description: 'این ملک غیر دربست است و برخی فضاها با میزبان یا مهمان دیگر مشترک است',
      group: PropertyOptionGroup.OWNERSHIP,
    },
    {
      title: 'سرایدار مقیم',
      group: PropertyOptionGroup.OWNERSHIP,
    },
    {
      title: 'روباز',
      group: PropertyOptionGroup.POOL_TYPE,
      key: 'open_pool',
    },
    {
      title: 'آب گرم',
      group: PropertyOptionGroup.POOL_TYPE,
      key: 'warm_pool',
    },
    {
      title: 'داخل واحد',
      group: PropertyOptionGroup.POOL_TYPE,
    },
  ];
  return options;
};
/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export async function propertyOptionsSeeder(): Promise<void> {
  console.time('✅ PROPERTY OPTIONS');
  for (const e of data()) {
    const item = await prisma.propertyOption.findFirst({ where: { title: e.title } });
    if (!item) await prisma.propertyOption.create({ data: e });
  }
  console.timeEnd('✅ PROPERTY OPTIONS');
}
