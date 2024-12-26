import { Module } from '@nestjs/common';
import { OwnerUserController } from './user.controller';
import { OwnerUserService } from './user.service';

@Module({
  controllers: [OwnerUserController],
  providers: [OwnerUserService],
  exports: [OwnerUserService],
})
export class OwnerUserModule {}
