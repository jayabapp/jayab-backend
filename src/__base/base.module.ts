import { Module } from '@nestjs/common';
//@admin import { BaseAdminModule } from './roles/admin/admin.module';
//@user import { BaseUserModule } from './roles/user/user.module';
//@owner import { BaseOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    //@admin BaseAdminModule,
    //@user BaseUserModule
    //@owner BaseOwnerModule
  ],
})
export class BaseModule {}
