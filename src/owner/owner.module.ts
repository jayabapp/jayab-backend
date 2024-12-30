import { Module } from '@nestjs/common';
import { OwnerAdminModule } from './roles/admin/admin.module';
import { OwnerUserModule } from './roles/user/user.module';

@Module({
  imports: [
    OwnerAdminModule,
    OwnerUserModule
  ],
})
export class OwnerModule {}
