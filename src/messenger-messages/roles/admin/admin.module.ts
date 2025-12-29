import { Module } from '@nestjs/common';
import { MessengerMessagesAdminController } from './admin.controller';
import { MessengerMessagesAdminService } from './admin.service';

@Module({
  controllers: [MessengerMessagesAdminController],
  providers: [MessengerMessagesAdminService],
})
export class MessengerMessagesAdminModule {}
