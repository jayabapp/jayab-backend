import { Module } from '@nestjs/common';
import { PropertyBadgeAdminModule } from './roles/admin/admin.module';
//@user import { PropertyBadgeUserModule } from './roles/user/user.module';
import { PropertyBadgeOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    PropertyBadgeAdminModule,
    //@user PropertyBadgeUserModule
    PropertyBadgeOwnerModule
  ],
})
export class PropertyBadgeModule {}
