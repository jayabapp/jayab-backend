import { Prisma, PrismaClient } from '@prisma/client';
import cities from '../../src/city/common/constant/cities.json';
import provinces from '../../src/city/common/constant/provinces.json';
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                    SEED                                    */
/* -------------------------------------------------------------------------- */

const createProvinceData = (): Prisma.CityCreateInput[] => {
  const data: Prisma.CityCreateManyInput[] = [];

  for (const province of provinces) {
    const rec: Prisma.CityCreateInput = {
      title: province.name,
      tel_prefix: province.tel_prefix,
      slug: province.slug,
      slug_fa: province.slug_fa,
      sort_order: province.sort_order || null,
    };
    data.push(rec);
  }

  return data;
};

const createCityData = (): Prisma.CityCreateInput[] => {
  const data: Prisma.CityCreateManyInput[] = [];

  for (const city of cities) {
    const rec: Prisma.CityUncheckedCreateInput = {
      title: city.title,
      slug: city.slug,
      parent_id: city.province_id,
    };
    data.push(rec);
  }

  return data;
};

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export async function citySeeder(): Promise<void> {
  console.time('✅ City');
  // await prisma.$queryRaw`truncate table cities restart identity cascade`;
  const citiesCount = await prisma.city.count();

  if (citiesCount == 0) {
    const provincesList = createProvinceData();
    const citiesList = createCityData();

    for (const item of provincesList) {
      await prisma.city.create({ data: item });
    }

    for (const item of citiesList) {
      await prisma.city.create({ data: item });
    }
  }
  console.timeEnd('✅ City');
}
