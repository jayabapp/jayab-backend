import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import provinces from '../../src/city/common/constant/provinces.json';
import cities from '../../src/city/common/constant/cities.json';

/* -------------------------------------------------------------------------- */
/*                                    SEED                                    */
/* -------------------------------------------------------------------------- */

const createData = (): Prisma.CityCreateInput[] => {
  const data: Prisma.CityCreateManyInput[] = [];

  for (const province of provinces) {
    const c = cities
      .filter((e) => e.province_id == province.id)
      .map((e) => ({ title: e.name, slug: e.slug }));
    const rec: Prisma.CityCreateInput = {
      title: province.name,
      tel_prefix: province.tel_prefix,
      slug: province.slug,
      sort_order: province.name == 'تهران' ? 1 : province.name == 'البرز' ? 2 : null,
      child: {
        createMany: {
          data: c,
          skipDuplicates: true,
        },
      },
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
    // const list = createData();

    // const iranCountry = await prisma.city.create({
    //   data: { title: 'ایران', tel_prefix: '+98', slug: 'ایران', sort_order: 1 },
    // });

    // for (const item of list) {
    //   await prisma.city.create({ data: { ...item, parent: { connect: { id: iranCountry.id } } } });
    // }

    await prisma.city.create({ data: { title: 'تهران', child: { create: { title: 'تهران' } } } });
    await prisma.city.create({ data: { title: 'البرز', child: { create: { title: 'کرج' } } } });
  }
  console.timeEnd('✅ City');
}
