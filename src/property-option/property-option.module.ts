import { Module } from '@nestjs/common';
import { PropertyOptionAdminModule } from './roles/admin/admin.module';
//@user import { PropertyOptionUserModule } from './roles/user/user.module';

@Module({
  imports: [
    PropertyOptionAdminModule,
    //@user PropertyOptionUserModule
  ],
})
export class PropertyOptionModule {}
