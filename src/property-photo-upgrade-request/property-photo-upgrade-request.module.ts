import { Module } from '@nestjs/common';
import { PropertyPhotoUpgradeRequestAdminModule } from './roles/admin/admin.module';

@Module({
  imports: [PropertyPhotoUpgradeRequestAdminModule],
})
export class PropertyPhotoUpgradeRequestModule {}
