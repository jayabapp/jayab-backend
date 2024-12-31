import { PrismaClient } from '@prisma/client';
import { superadminSeeder } from './superadmin.seeder';
import { moduleSeeder } from './module.seeder';
import { categorySeeder } from './category.seeder';
import { settingSeeder } from './setting.seeder';
import { contentSeeder } from './content.seeder';
import { paymentGatewaySeeder } from './payment-gateway.seeder';
import { paymentMethodSeeder } from './payment-method.seeder';
import { fakerSeeder } from './faker.seeder';
import { citySeeder } from './city.seeder';
import { propertyOptionsSeeder } from './property-options.seeder';
import { subscriptionPlanSeeder } from './subscription-plans.seeder';
const prisma = new PrismaClient();

/**
 * 1. add seeder name in seeders array
 * 2. create seeder function and import
 * 3. add seeder case in switch
 * 4. add seeder at 'all' case in switch
 * 5. keep seed ordering
 */

/* ------------------------------------ 1 ----------------------------------- */
const seeders = [
  'all',
  'superadmin',
  'modules',
  'settings',
  'category',
  'content',
  'gateway',
  'paymentMethod',
  'faker',
  'city',
  'propOptions',
  'subPlan',
];

async function main(): Promise<void> {
  console.time('Seeding...');

  const arg = process.argv?.find((e) => e.startsWith('--seeder='));
  if (!arg) return console.error('🚫 Wrong seeder name!');

  const argValue = arg.split('=')[1];

  if (!seeders.includes(argValue)) return console.error('🚫 Wrong seeder name!');

  /* ------------------------------------ 3 ----------------------------------- */
  switch (argValue) {
    case 'superadmin':
      await superadminSeeder();
      break;

    case 'modules':
      await moduleSeeder();
      break;

    case 'category':
      await categorySeeder();
      break;

    case 'settings':
      await settingSeeder();
      break;

    case 'content':
      await contentSeeder();
      break;

    case 'gateway':
      await paymentGatewaySeeder();
      break;

    case 'paymentMethod':
      await paymentMethodSeeder();
      break;

    case 'city':
      await citySeeder();
      break;

    case 'propOptions':
      await propertyOptionsSeeder();
      break;

    case 'subPlan':
      await subscriptionPlanSeeder();
      break;

    /* ------------------------------------ 4 ----------------------------------- */
    case 'all':
      await superadminSeeder();
      await moduleSeeder();
      await contentSeeder();
      await citySeeder();
      await settingSeeder();
      await paymentGatewaySeeder();
      await paymentMethodSeeder();
      await propertyOptionsSeeder();
      await subscriptionPlanSeeder();

      break;

    case 'faker':
      await superadminSeeder();
      await moduleSeeder();
      await contentSeeder();
      await citySeeder();
      await settingSeeder();
      await paymentGatewaySeeder();
      await paymentMethodSeeder();
      await propertyOptionsSeeder();
      await subscriptionPlanSeeder();
      await fakerSeeder();
      break;
  }

  console.timeEnd('Seeding...');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
