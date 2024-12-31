import { Module } from '@nestjs/common';
import { SubscriptionPlanUserController } from './user.controller';
import { SubscriptionPlanUserService } from './user.service';

@Module({
  controllers: [SubscriptionPlanUserController],
  providers: [SubscriptionPlanUserService],
})
export class SubscriptionPlanUserModule {}
