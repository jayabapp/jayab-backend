import { Module } from '@nestjs/common';
import { ChatUserController } from './user.controller';
import { SharedChatService } from 'src/chat/shared-chat.service';
import { SocketModule } from 'src/socket/socket.module';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { PropertyUserModule } from 'src/property/roles/user/user.module';
import { BullModule } from '@nestjs/bull';
import { CHAT_MESSAGE_SMS_QUEUE } from 'src/chat/processors/queue-name.constants';
import { ChatMessageSmsQueueProcessor } from 'src/chat/processors/chat.queue';

@Module({
  imports: [
    BullModule.registerQueue({ name: CHAT_MESSAGE_SMS_QUEUE }),
    SocketModule,
    AttachmentModule,
    PropertyUserModule,
  ],
  controllers: [ChatUserController],
  providers: [SharedChatService, ChatMessageSmsQueueProcessor],
})
export class ChatUserModule {}
