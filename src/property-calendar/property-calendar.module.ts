import { Module } from '@nestjs/common';
//@admin import { PropertyCalendarAdminModule } from './roles/admin/admin.module';
//@user import { PropertyCalendarUserModule } from './roles/user/user.module';
import { PropertyCalendarOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    //@admin PropertyCalendarAdminModule,
    //@user PropertyCalendarUserModule
    PropertyCalendarOwnerModule
  ],
})
export class PropertyCalendarModule {}
