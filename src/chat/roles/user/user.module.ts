import { Module } from '@nestjs/common';
import { ChatUserController } from './user.controller';
import { SharedChatService } from 'src/chat/shared-chat.service';
import { SocketModule } from 'src/socket/socket.module';
import { AttachmentModule } from 'src/attachment/attachment.module';

@Module({
  imports: [SocketModule, AttachmentModule],
  controllers: [ChatUserController],
  providers: [SharedChatService],
})
export class ChatUserModule {}
