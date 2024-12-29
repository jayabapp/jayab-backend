import { Module } from '@nestjs/common';
//@admin import { PropertyAdminModule } from './roles/admin/admin.module';
import { PropertyUserModule } from './roles/user/user.module';

@Module({
  imports: [
    //@admin PropertyAdminModule,
    PropertyUserModule
  ],
})
export class PropertyModule {}
