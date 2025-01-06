import { Module } from '@nestjs/common';
import { PropertyAuthorizeAdminModule } from './roles/admin/admin.module';
//@user import { PropertyAuthorizeUserModule } from './roles/user/user.module';
import { PropertyAuthorizeOwnerModule } from './roles/owner/owner.module';
import { NotificationSharedModule } from 'src/notification/roles/shared/shared.module';

@Module({
  imports: [
    PropertyAuthorizeAdminModule,
    //@user PropertyAuthorizeUserModule
    PropertyAuthorizeOwnerModule,
    NotificationSharedModule,
  ],
})
export class PropertyAuthorizeModule {}
