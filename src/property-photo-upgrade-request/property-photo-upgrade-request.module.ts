import { Module } from '@nestjs/common';
import { PropertyPhotoUpgradeRequestAdminModule } from './roles/admin/admin.module';
import { PropertyPhotoUpgradeRequestOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [PropertyPhotoUpgradeRequestAdminModule, PropertyPhotoUpgradeRequestOwnerModule],
})
export class PropertyPhotoUpgradeRequestModule {}
