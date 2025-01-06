import { Module } from '@nestjs/common';
import { PropertyAuthorizeAdminModule } from './roles/admin/admin.module';
//@user import { PropertyAuthorizeUserModule } from './roles/user/user.module';
import { PropertyAuthorizeOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    PropertyAuthorizeAdminModule,
    //@user PropertyAuthorizeUserModule
    PropertyAuthorizeOwnerModule,
  ],
})
export class PropertyAuthorizeModule {}
