import { Module } from '@nestjs/common';
import { PeakDayAdminController } from './admin.controller';
import { PeakDayAdminService } from './admin.service';

@Module({
  controllers: [PeakDayAdminController],
  providers: [PeakDayAdminService],
})
export class PeakDayAdminModule {}
