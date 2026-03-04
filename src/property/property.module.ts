import { Module } from '@nestjs/common';
import { PropertyAdminModule } from './roles/admin/admin.module';
import { PropertyOwnerModule } from './roles/owner/owner.module';
import { PropertyUserModule } from './roles/user/user.module';
import { PropertyMianModule } from './roles/mian/mian.module';

@Module({
  imports: [PropertyAdminModule, PropertyUserModule, PropertyOwnerModule, PropertyMianModule],
})
export class PropertyModule {}
