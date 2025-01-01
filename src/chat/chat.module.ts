import { Module } from '@nestjs/common';
import { ChatUserModule } from './roles/user/user.module';
import { SharedChatService } from './shared-chat.service';
// import { ChatBusinessModule } from './roles/business/business.module';

@Module({
  imports: [ChatUserModule],
})
export class ChatModule {}
