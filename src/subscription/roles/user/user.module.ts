import { Module } from '@nestjs/common';
import { SubscriptionUserController } from './user.controller';
import { SubscriptionUserService } from './user.service';

@Module({
  controllers: [SubscriptionUserController],
  providers: [SubscriptionUserService],
})
export class SubscriptionUserModule {}
