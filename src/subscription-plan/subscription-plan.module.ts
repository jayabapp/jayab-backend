import { Module } from '@nestjs/common';
import { SubscriptionPlanAdminModule } from './roles/admin/admin.module';
import { SubscriptionPlanUserModule } from './roles/user/user.module';

@Module({
  imports: [
    SubscriptionPlanAdminModule,
    SubscriptionPlanUserModule
  ],
})
export class SubscriptionPlanModule {}
