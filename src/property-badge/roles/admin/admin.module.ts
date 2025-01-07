import { Module } from '@nestjs/common';
import { PropertyBadgeAdminController } from './admin.controller';
import { PropertyBadgeAdminService } from './admin.service';

@Module({
  controllers: [PropertyBadgeAdminController],
  providers: [PropertyBadgeAdminService],
})
export class PropertyBadgeAdminModule {}
