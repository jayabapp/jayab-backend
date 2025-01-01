import { Module } from '@nestjs/common';
import { SubscriptionPlanAdminController } from './admin.controller';
import { SubscriptionPlanAdminService } from './admin.service';

@Module({
  controllers: [SubscriptionPlanAdminController],
  providers: [SubscriptionPlanAdminService],
})
export class SubscriptionPlanAdminModule {}
