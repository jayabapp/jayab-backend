import { Global, Module } from '@nestjs/common';
import { NotificationAdminModule } from './roles/admin/admin.module';

@Module({
  imports: [NotificationAdminModule],
})
export class NotificationModule {}
