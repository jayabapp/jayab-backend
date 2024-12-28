import { Module } from '@nestjs/common';
import { UserAdminController } from './admin.controller';
import { UserAdminService } from './admin.service';

@Module({
  controllers: [UserAdminController],
  providers: [UserAdminService],
})
export class UserAdminModule {}
