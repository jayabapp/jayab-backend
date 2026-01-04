import { Module } from '@nestjs/common';
import { PropertyReportAdminController } from './admin.controller';
import { PropertyReportAdminService } from './admin.service';

@Module({
  controllers: [PropertyReportAdminController],
  providers: [PropertyReportAdminService],
})
export class PropertyReportAdminModule {}
