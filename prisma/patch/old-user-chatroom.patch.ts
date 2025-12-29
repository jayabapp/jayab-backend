import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                   PATCH                                    */
/* -------------------------------------------------------------------------- */
export async function oldUserChatroom(): Promise<void> {
  console.time('✅ UPDATE PARTICIPANT');
  const users = await prisma.user.findMany({ select: { id: true, mobile_number: true } });

  for (const e of users) {
    await prisma.messengerParticipant.updateMany({
      where: { user_id: e.id },
      data: { user_mobile_number: e.mobile_number },
    });
  }

  console.timeEnd('✅ UPDATE PARTICIPANT');
}
