import { Module } from '@nestjs/common';
//@admin import { OwnerAdminModule } from './roles/admin/admin.module';
import { OwnerUserModule } from './roles/user/user.module';

@Module({
  imports: [
    //@admin OwnerAdminModule,
    OwnerUserModule
  ],
})
export class OwnerModule {}
