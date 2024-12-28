import { Module } from '@nestjs/common';
import { AdvisorAdminController } from './admin.controller';
import { AdvisorAdminService } from './admin.service';

@Module({
  controllers: [AdvisorAdminController],
  providers: [AdvisorAdminService],
})
export class AdvisorAdminModule {}
