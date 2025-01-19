import { Module } from '@nestjs/common';
import { SubscriptionAdminModule } from './roles/admin/admin.module';
//@user import { SubscriptionUserModule } from './roles/user/user.module';
//@owner import { SubscriptionOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    SubscriptionAdminModule,
    //@user SubscriptionUserModule
    //@owner SubscriptionOwnerModule
  ],
})
export class SubscriptionModule {}
