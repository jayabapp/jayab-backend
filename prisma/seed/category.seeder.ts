import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                    SEED                                    */
/* -------------------------------------------------------------------------- */
const parents = (): Prisma.CategoryCreateInput[] => {
  const data: Prisma.CategoryCreateInput[] = [
    { title: 'ساعت مردانه', key: 'forMan', path: '-' },
    { title: 'ساعت زنانه', key: 'forWomen', path: '-' },
    { title: 'ماشین حساب', key: 'calculator', path: '-' },
  ];

  return data;
};

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export async function categorySeeder(): Promise<void> {
  console.time('✅ Category');
  for (const parent of parents()) {
    await prisma.category.upsert({
      where: { key: parent.key },
      update: parent,
      create: parent,
    });
  }
  console.timeEnd('✅ Category');
}
