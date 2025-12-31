import { Module } from '@nestjs/common';
import { MessengerChatroomAdminController } from './admin.controller';
import { MessengerChatroomAdminService } from './admin.service';

@Module({
  controllers: [MessengerChatroomAdminController],
  providers: [MessengerChatroomAdminService],
})
export class MessengerChatroomAdminModule {}
