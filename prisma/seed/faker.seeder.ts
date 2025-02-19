import { type Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                    SEED                                    */
/* -------------------------------------------------------------------------- */
const attachments = (): Prisma.AttachmentUncheckedCreateInput[] => {
  const data: Prisma.AttachmentUncheckedCreateInput[] = [
    {
      admin_id: 1,
      name: 'profile.jpeg',
      thumbnail: 'profile.jpeg',
      medium: 'profile.jpeg',
      type: 1,
      path: 'kian',
      bucket: process.env.BUCKET_NAME,
      end_point: process.env.S3_FS1_ENDPOINT,
    },
    {
      admin_id: 1,
      name: 'profile2.jpg',
      thumbnail: 'profile2.jpg',
      medium: 'profile2.jpg',
      type: 1,
      path: 'kian',
      bucket: process.env.BUCKET_NAME,
      end_point: process.env.S3_FS1_ENDPOINT,
    },
    {
      admin_id: 1,
      name: 'profile3.jpg',
      thumbnail: 'profile3.jpg',
      medium: 'profile3.jpg',
      type: 1,
      path: 'kian',
      bucket: process.env.BUCKET_NAME,
      end_point: process.env.S3_FS1_ENDPOINT,
    },
    {
      admin_id: 1,
      name: 'logo.jpeg',
      thumbnail: 'logo.jpeg',
      medium: 'logo.jpeg',
      type: 1,
      path: 'kian',
      bucket: process.env.BUCKET_NAME,
      end_point: process.env.S3_FS1_ENDPOINT,
    },
    {
      admin_id: 1,
      name: 'logo2.jpeg',
      thumbnail: 'logo2.jpeg',
      medium: 'logo2.jpeg',
      type: 1,
      path: 'kian',
      bucket: process.env.BUCKET_NAME,
      end_point: process.env.S3_FS1_ENDPOINT,
    },
    {
      admin_id: 1,
      name: 'logo3.png',
      thumbnail: 'logo3.png',
      medium: 'logo3.png',
      type: 1,
      path: 'kian',
      bucket: process.env.BUCKET_NAME,
      end_point: process.env.S3_FS1_ENDPOINT,
    },
  ];

  return data;
};

const users = (): Prisma.UserUncheckedCreateInput[] => {
  const data: Prisma.UserUncheckedCreateInput[] = [
    {
      mobile_number: '09120000000',
      full_name: 'پیمان کیانی',
      referral_code: '123456',
      profile_image_id: 1,
    },
    {
      mobile_number: '09120000001',
      full_name: 'آیدا طاهری',
      referral_code: '654321',
      profile_image_id: 2,
    },
    {
      mobile_number: '09120000002',
      full_name: 'سیامک محمدی',
      referral_code: '123123',
    },
  ];

  return data;
};

const owners = (): Prisma.OwnerUncheckedCreateInput[] => {
  const data: Prisma.OwnerUncheckedCreateInput[] = [
    {
      national_code: '0018763529',
      selfie_image_id: 3,
      user: { connect: { id: 3 } },
      status: 10,
    },
  ];

  return data;
};

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export async function fakerSeeder(): Promise<void> {
  console.time('✅ Faker');
  const attachmentsCount = await prisma.attachment.count();
  if (attachmentsCount === 0) await prisma.attachment.createMany({ data: attachments() });

  for (const e of users()) {
    const item = await prisma.user.findUnique({ where: { mobile_number: e.mobile_number } });
    if (!item) await prisma.user.create({ data: e });
  }

  for (const e of owners()) {
    const item = await prisma.owner.findFirst({ where: { national_code: e.national_code } });
    if (!item) await prisma.owner.create({ data: e });
  }

  console.timeEnd('✅ Faker');
}
