import { Prisma, PrismaClient } from '@prisma/client';
import { SettingDataType } from '../../src/setting/common/interfaces/settings.interface';
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                    SEED                                    */
/* -------------------------------------------------------------------------- */
const settings = (): Prisma.SettingCreateInput[] => {
  const data: Prisma.SettingCreateInput[] = [
    {
      title: 'کلید تگ منیجر گوگل',
      key: 'GOOGLE_TAG_MANAGER_KEY',
      value: 'GTM-52N8D',
      sort_order: 50,
      data_type: SettingDataType.TEXT,
    },
    {
      title: 'تعداد روز معتبر بودن نردبان',
      key: 'PROPERTY_PROMOTE_DURATION',
      value: '7',
      sort_order: 40,
      data_type: SettingDataType.NUMBER,
    },
    {
      title: 'تعداد مجاز کلیک روی شماره تماس در بازه مشخص',
      key: 'CALL_CLICK_LIMIT',
      value: '10',
      sort_order: 10,
      data_type: SettingDataType.NUMBER,
    },
    {
      title: 'بازه بررسی تعداد کلیک روی دکمه تماس (دقیقه)',
      key: 'CALL_CLICK_CHECKING_DURATION',
      value: '120',
      sort_order: 20,
      data_type: SettingDataType.NUMBER,
    },
    {
      title: 'مدت زمان مسدود شدن اکانت با کلیک زیاد (روز)',
      key: 'CALL_CLICK_BAN_TTL',
      value: '1',
      sort_order: 30,
      data_type: SettingDataType.NUMBER,
    },
    {
      title: 'شماره موبایل جایاب برای جایگزین شماره مالک',
      key: 'JAYAB_MOBILE_NUMBER',
      value: '',
      sort_order: 40,
      data_type: SettingDataType.TEXT,
    },
    {
      title: 'شماره موبایل جایاب برای دریافت اعلانات',
      key: 'JAYAB_MOBILE_FOR_ANNOUNCEMENTS',
      value: '',
      sort_order: 50,
      data_type: SettingDataType.TEXT,
    },
    {
      title: 'موبایل ادمین برای پیامک تیکت جدید - یک',
      key: 'JAYAB_MOBILE_FOR_TICKET_1',
      value: '09127140824',
      sort_order: 60,
      data_type: SettingDataType.TEXT,
    },
    {
      title: 'موبایل ادمین برای پیامک تیکت جدید - دو',
      key: 'JAYAB_MOBILE_FOR_TICKET_2',
      value: '09126048740',
      sort_order: 61,
      data_type: SettingDataType.TEXT,
    },
    {
      title: 'قیمت ویرایش هر عکس اقامتگاه',
      key: 'PROPERTY_PHOTO_UPGRADE_PRICE',
      value: '50000',
      sort_order: 70,
      data_type: SettingDataType.NUMBER,
    },
    {
      title: 'تصویر نمونه قبل از ویرایش (سرویس ارتقا تصاویر)',
      key: 'PROPERTY_PHOTO_UPGRADE_BEFORE_IMAGE',
      value: '',
      sort_order: 71,
      data_type: SettingDataType.TEXT,
    },
    {
      title: 'تصویر نمونه بعد از ویرایش (سرویس ارتقا تصاویر)',
      key: 'PROPERTY_PHOTO_UPGRADE_AFTER_IMAGE',
      value: '',
      sort_order: 72,
      data_type: SettingDataType.TEXT,
    },
  ];

  return data;
};

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export async function settingSeeder(): Promise<void> {
  console.time('✅ SETTINGS');
  for (const e of settings()) {
    await prisma.setting.upsert({ where: { key: e.key }, update: {}, create: e });
  }
  console.timeEnd('✅ SETTINGS');
}
