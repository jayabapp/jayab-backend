import { Module } from '@nestjs/common';
//@admin import { BaseAdminModule } from './roles/admin/admin.module';
//@user import { BaseUserModule } from './roles/user/user.module';

@Module({
  imports: [
    //@admin BaseAdminModule,
    //@user BaseUserModule
  ],
})
export class BaseModule {}
