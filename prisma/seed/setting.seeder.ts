import { Prisma, PrismaClient } from '@prisma/client';
import { SettingDataType } from '../../src/setting/common/interfaces/settings.interface';
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                    SEED                                    */
/* -------------------------------------------------------------------------- */
const settings = (): Prisma.SettingCreateInput[] => {
  const data: Prisma.SettingCreateInput[] = [
    {
      title: 'درصد مالیات بر ارزش افزوده',
      key: 'TAX_PERCENTAGE',
      value: '9',
      min: 0,
      max: 90,
      sort_order: 1,
      data_type: SettingDataType.NUMBER,
    },
    {
      title: 'ساعت شروع حراج روزانه',
      key: 'DAILY_OFFER_FROM',
      value: '8',
      min: 0,
      max: 24,
      sort_order: 2,
      data_type: SettingDataType.NUMBER,
    },
    {
      title: 'ساعت پایان حراج روزانه',
      key: 'DAILY_OFFER_TO',
      value: '22',
      min: 0,
      max: 24,
      sort_order: 3,
      data_type: SettingDataType.NUMBER,
    },
    {
      title: 'شعاع ثبت درخواست (کیلومتر)',
      key: 'ALLOWED_RADIUS_FOR_ORDERING',
      value: '1500',
      min: 1,
      max: 2000,
      sort_order: 5,
      data_type: SettingDataType.NUMBER,
    },
    {
      title: 'کلید تگ منیجر گوگل',
      key: 'GOOGLE_TAG_MANAGER_KEY',
      value: 'GTM-52N8D',
      sort_order: 4,
      data_type: SettingDataType.TEXT,
    },
    {
      title: 'موبایل ادمین برای دریافت پیامک - یک',
      key: 'ADMIN_SMS_MOBILE_1',
      value: '0912604',
      sort_order: 10,
      data_type: SettingDataType.NUMBER,
    },
    {
      title: 'موبایل ادمین برای دریافت پیامک - دو',
      key: 'ADMIN_SMS_MOBILE_2',
      value: '',
      sort_order: 11,
      data_type: SettingDataType.NUMBER,
    },
    {
      title: 'موبایل ادمین برای دریافت پیامک - سه',
      key: 'ADMIN_SMS_MOBILE_3',
      value: '',
      sort_order: 12,
      data_type: SettingDataType.NUMBER,
    },
    {
      title: 'کاربر بدون  رجیستر ادمین  نتواند لاگین کند',
      key: 'BLOCK_UNREGISTERED_USER',
      value: '0',
      min: 0,
      max: 1,
      sort_order: 13,
      data_type: SettingDataType.NUMBER,
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
    await prisma.setting.upsert({ where: { key: e.key }, update: e, create: e });
  }
  console.timeEnd('✅ SETTINGS');
}
