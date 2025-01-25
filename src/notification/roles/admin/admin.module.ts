import { Module } from '@nestjs/common';
import { NotificationAdminController } from './admin.controller';
import { NotificationAdminService } from './admin.service';
import { SendNotificationAdminService } from './send-notification-admin.service';

@Module({
  controllers: [NotificationAdminController],
  providers: [NotificationAdminService, SendNotificationAdminService],
})
export class NotificationAdminModule {}
