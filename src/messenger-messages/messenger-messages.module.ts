import { Module } from '@nestjs/common';
import { MessengerMessagesAdminModule } from './roles/admin/admin.module';
//@user import { MessengerMessagesUserModule } from './roles/user/user.module';
//@owner import { MessengerMessagesOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    MessengerMessagesAdminModule,
    //@user MessengerMessagesUserModule
    //@owner MessengerMessagesOwnerModule
  ],
})
export class MessengerMessagesModule {}
