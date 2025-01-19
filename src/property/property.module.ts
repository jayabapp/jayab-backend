import { Module } from '@nestjs/common';
import { PropertyAdminModule } from './roles/admin/admin.module';
import { PropertyUserModule } from './roles/user/user.module';
import { PropertyOwnerController } from './roles/owner/owner.controller';
import { PropertyOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    PropertyAdminModule,
    PropertyUserModule,
    PropertyOwnerModule,
  ],
})
export class PropertyModule {}
