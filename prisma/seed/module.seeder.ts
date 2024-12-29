import { Prisma, PrismaClient } from '@prisma/client';
import { superadminSeeder } from './superadmin.seeder';
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                    SEED                                    */
/* -------------------------------------------------------------------------- */
const modules = (): Prisma.AccessControlModuleCreateInput[] => {
  const data: Prisma.AccessControlModuleCreateInput[] = [
    { name: 'نقش های ادمین', key: 'access-control' },
    { name: 'داشبورد', key: 'dashboard' },
    { name: 'تنظیمات سئو', key: 'seo-setting' },
    { name: 'فـرم سـاز', key: 'form-builder' },
    { name: 'گزارش های ادمین', key: 'admin-report' },
    { name: 'شهرها', key: 'cities' },
    { name: 'بنرها', key: 'banners' },
    { name: 'تنظیمات', key: 'settings' },
    { name: 'آپلود فایل', key: 'attachments' },
    { name: 'محتواها', key: 'contents' },
    { name: 'کاربرها', key: 'users' },
    { name: 'احراز هویت', key: 'auth' },
    { name: 'دسته بندی فروشگاه', key: 'categories' },
    { name: 'فروشگاه ها', key: 'businesses' },
    { name: 'تیکت ها', key: 'tickets' },
    { name: 'واحد محصول', key: 'product-units' },
    { name: 'محصولات', key: 'products' },
    { name: 'تگ ها', key: 'tags' },
    { name: 'کسب . کارها', key: 'businesses' },
    { name: 'دسته بندی محتوا', key: 'content-categories' },
    { name: 'محصولات کسب و کار', key: 'business-products' },
    { name: 'سفارشات', key: 'orders' },
    { name: 'کد تخفیف', key: 'offer-codes' },
    { name: 'تراکنش ها', key: 'turnovers' },
    { name: 'گزارش', key: 'reports' },
    { name: 'گروه های ویژگی محصول', key: 'attribute-groups' },
    { name: 'ویژگی محصول', key: 'attributes' },
    { name: 'مشخصات دسته بندی', key: 'specifications' },
    { name: 'مشخصات محصول', key: 'product-specifications' },
    { name: 'برند', key: 'brands' },
    { name: 'تگ محصول', key: 'product-tags' },
    { name: 'قیمت محصولات', key: 'business-product-prices' },
    { name: 'گروه مشخصات', key: 'specification-groups' },
    { name: 'نظرات محصول', key: 'product-comments' },
    { name: 'فرم های ثبت شده', key: 'submitted-forms' },
    { name: 'آیتم های فرم ثبت شده', key: 'submitted-form-items' },
    { name: 'ارتباط با ما', key: 'contact-us' },
    { name: 'پرسش و پاسخ محتوا', key: 'content-questions' },
    { name: 'روش های ارسال', key: 'delivery-methods' },
    { name: 'درگاه های پرداخت', key: 'payment-gateways' },
    { name: 'روش پرداخت', key: 'payment-methods' },
    { name: 'اعلانات', key: 'notifications' },
    { name: 'آدرس های کاربر', key: 'user-addresses' },
    { name: 'مشاوران', key: 'advisors' },
    { name: 'مالکان', key: 'owners' },
   { name: 'آپشن های ملک', key: 'property-options'},
 ];

  return data;
};

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export async function moduleSeeder(): Promise<void> {
  console.time('✅ Modules');

  await superadminSeeder();

  for (const module of modules()) {
    const updatedModule = await prisma.accessControlModule.upsert({
      where: { key: module.key },
      update: { name: module.name },
      create: module,
    });
    await prisma.accessControlList.upsert({
      where: { module_id_role_id: { module_id: updatedModule.id, role_id: 1 } },
      create: { module_id: updatedModule.id, role_id: 1, c: true, r: true, u: true, d: true, v: true },
      update: {},
    });
  }
  console.timeEnd('✅ Modules');
}
