import { Module } from '@nestjs/common';
import { SubscriptionAdminController } from './admin.controller';
import { SubscriptionAdminService } from './admin.service';
import { SubscriptionPlanAdminModule } from 'src/subscription-plan/roles/admin/admin.module';

@Module({
  imports: [SubscriptionPlanAdminModule],
  controllers: [SubscriptionAdminController],
  providers: [SubscriptionAdminService],
})
export class SubscriptionAdminModule {}
