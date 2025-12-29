import { PrismaClient } from '@prisma/client';
import { oldUserChatroom } from './old-user-chatroom.patch';
const prisma = new PrismaClient();

/* ------------------------------------ 1 ----------------------------------- */
const patchers = ['oldUserChatroom'];

async function main(): Promise<void> {
  console.time('Patching...');

  const arg = process.argv?.find((e) => e.startsWith('--patcher='));

  if (!arg) return console.error('🚫 Wrong patcher name!');

  const argValue = arg.split('=')[1];

  if (!patchers.includes(argValue)) return console.error('🚫 Wrong patcher name!');

  /* ------------------------------------ 3 ----------------------------------- */
  switch (argValue) {
    case 'oldUserChatroom':
      await oldUserChatroom();
      break;
  }

  console.timeEnd('Patching...');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
