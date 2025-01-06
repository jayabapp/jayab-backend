import { Module } from '@nestjs/common';
//@admin import { PropertyReservedDaysAdminModule } from './roles/admin/admin.module';
//@user import { PropertyReservedDaysUserModule } from './roles/user/user.module';
import { PropertyReservedDaysOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    //@admin PropertyReservedDaysAdminModule,
    //@user PropertyReservedDaysUserModule
    PropertyReservedDaysOwnerModule
  ],
})
export class PropertyReservedDaysModule {}
