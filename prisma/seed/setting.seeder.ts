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
      sort_order: 4,
      data_type: SettingDataType.TEXT,
    },
    {
      title: 'تعداد روز معتبر بودن نردبان',
      key: 'PROPERTY_PROMOTE_DURATION',
      value: '7',
      sort_order: 1,
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
    await prisma.setting.upsert({ where: { key: e.key }, update: {}, create: e });
  }
  console.timeEnd('✅ SETTINGS');
}
