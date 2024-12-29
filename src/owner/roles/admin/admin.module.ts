import { Module } from '@nestjs/common';
import { OwnerAdminController } from './admin.controller';
import { OwnerAdminService } from './admin.service';

@Module({
  controllers: [OwnerAdminController],
  providers: [OwnerAdminService],
})
export class OwnerAdminModule {}
