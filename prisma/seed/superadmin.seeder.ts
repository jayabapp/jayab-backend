import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { hashPassword } from '../../src/auth/common/helpers/admin-password-hash.helper';

/* -------------------------------------------------------------------------- */
/*                                    SEED                                    */
/* -------------------------------------------------------------------------- */
const rbacRole = (): Prisma.AccessControlRoleCreateInput[] => {
  const data: Prisma.AccessControlRoleCreateInput[] = [
    { name: 'superadmin', key: 'superadmin', tree: '-1-' },
    { name: 'ادمین', key: 'admin', tree: '-1-2-' },
    { name: 'فروشگاه دار', key: 'business_owner', tree: '-1-2-3-' },
  ];

  return data;
};
const admin = (): Prisma.AdminUncheckedCreateInput => {
  const password = hashPassword('admin@@1133');
  return {
    username: 'superadmin',
    password: password,
    mobile_number: '09126048740',
    full_name: 'سوپر ادمین',
    role_id: 1,
  };
};

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export async function superadminSeeder(): Promise<void> {
  console.time('✅ RBAC Role');
  for (const item of rbacRole()) {
    await prisma.accessControlRole.upsert({ where: { key: item.key }, update: item, create: item });
  }
  console.timeEnd('✅ RBAC Role');

  console.time('✅ Admin');
  await prisma.admin.upsert({
    where: { username: admin().username },
    update: { password: admin().password },
    create: admin(),
  });
  console.timeEnd('✅ Admin');
}
