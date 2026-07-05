import { Module } from '@nestjs/common';
import { PropertyPhotoUpgradeRequestOwnerController } from './owner.controller';
import { PropertyPhotoUpgradeRequestOwnerService } from './owner.service';

@Module({
  controllers: [PropertyPhotoUpgradeRequestOwnerController],
  providers: [PropertyPhotoUpgradeRequestOwnerService],
})
export class PropertyPhotoUpgradeRequestOwnerModule {}
