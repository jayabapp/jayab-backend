import { Module } from '@nestjs/common';
import { PropertyBadgeOwnerController } from './owner.controller';
import { PropertyBadgeOwnerService } from './owner.service';

@Module({
  controllers: [PropertyBadgeOwnerController],
  providers: [PropertyBadgeOwnerService],
})
export class PropertyBadgeOwnerModule {}
