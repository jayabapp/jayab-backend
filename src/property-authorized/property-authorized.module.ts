import { Module } from '@nestjs/common';
import { PropertyAuthorizedAdminModule } from './roles/admin/admin.module';
//@user import { PropertyAuthorizedUserModule } from './roles/user/user.module';
import { PropertyAuthorizedOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    PropertyAuthorizedAdminModule,
    //@user PropertyAuthorizedUserModule
    PropertyAuthorizedOwnerModule
  ],
})
export class PropertyAuthorizedModule {}
