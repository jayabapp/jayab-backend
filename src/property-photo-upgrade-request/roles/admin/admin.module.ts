import { Module } from '@nestjs/common';
import { PropertyPhotoUpgradeRequestAdminController } from './admin.controller';
import { PropertyPhotoUpgradeRequestAdminService } from './admin.service';

@Module({
  controllers: [PropertyPhotoUpgradeRequestAdminController],
  providers: [PropertyPhotoUpgradeRequestAdminService],
})
export class PropertyPhotoUpgradeRequestAdminModule {}
