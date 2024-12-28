import { Module } from '@nestjs/common';
import { NotificationAdminController } from './admin.controller';
import { NotificationAdminService } from './admin.service';

@Module({
  controllers: [NotificationAdminController],
  providers: [NotificationAdminService],
})
export class NotificationAdminModule {}
