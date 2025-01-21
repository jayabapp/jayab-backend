import { Module } from '@nestjs/common';
import { SubscriptionAdminModule } from './roles/admin/admin.module';
import { SubscriptionUserModule } from './roles/user/user.module';
//@owner import { SubscriptionOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    SubscriptionAdminModule,
    SubscriptionUserModule
    //@owner SubscriptionOwnerModule
  ],
})
export class SubscriptionModule {}
