import { Global, Module } from '@nestjs/common';
import { NotificationAdminModule } from './roles/admin/admin.module';
import { NotificationUserModule } from './roles/user/user.module';

@Module({
  imports: [NotificationAdminModule, NotificationUserModule],
})
export class NotificationModule {}
