import { Module } from '@nestjs/common';
import { SubscriptionPlanAdminModule } from './roles/admin/admin.module';
//@user import { SubscriptionPlanUserModule } from './roles/user/user.module';

@Module({
  imports: [
    SubscriptionPlanAdminModule,
    //@user SubscriptionPlanUserModule
  ],
})
export class SubscriptionPlanModule {}
