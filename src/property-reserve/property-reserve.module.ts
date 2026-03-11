import { Module } from '@nestjs/common';
import { PropertyReserveAdminModule } from './roles/admin/admin.module';
import { PropertyReserveUserModule } from './roles/user/user.module';
//@owner import { PropertyReserveOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    PropertyReserveAdminModule,
    PropertyReserveUserModule
    //@owner PropertyReserveOwnerModule
  ],
})
export class PropertyReserveModule {}
