import { Module } from '@nestjs/common';
import { MessengerChatroomAdminModule } from './roles/admin/admin.module';
//@user import { MessengerChatroomUserModule } from './roles/user/user.module';
//@owner import { MessengerChatroomOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    MessengerChatroomAdminModule,
    //@user MessengerChatroomUserModule
    //@owner MessengerChatroomOwnerModule
  ],
})
export class MessengerChatroomModule {}
