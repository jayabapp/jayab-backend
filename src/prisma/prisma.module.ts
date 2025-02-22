import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
// import { PrismaService2 } from './prisma.service2';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
