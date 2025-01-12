import { Module } from '@nestjs/common';
import { ChatUserController } from './user.controller';
import { SharedChatService } from 'src/chat/shared-chat.service';
import { SocketModule } from 'src/socket/socket.module';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { PropertyUserModule } from 'src/property/roles/user/user.module';

@Module({
  imports: [SocketModule, AttachmentModule, PropertyUserModule],
  controllers: [ChatUserController],
  providers: [SharedChatService],
})
export class ChatUserModule {}
