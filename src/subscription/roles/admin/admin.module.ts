import { Module } from '@nestjs/common';
import { SubscriptionAdminController } from './admin.controller';
import { SubscriptionAdminService } from './admin.service';

@Module({
  controllers: [SubscriptionAdminController],
  providers: [SubscriptionAdminService],
})
export class SubscriptionAdminModule {}
