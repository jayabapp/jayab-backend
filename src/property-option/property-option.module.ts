import { Module } from '@nestjs/common';
import { PropertyOptionAdminModule } from './roles/admin/admin.module';
import { PropertyOptionUserModule } from './roles/user/user.module';

@Module({
  imports: [
    PropertyOptionAdminModule,
    PropertyOptionUserModule
  ],
})
export class PropertyOptionModule {}
