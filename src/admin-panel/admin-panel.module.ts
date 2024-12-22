import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard/dashboard.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { ReportController } from './report/report.controller';
import { ReportService } from './report/report.service';

@Module({
  controllers: [DashboardController, ReportController],
  providers: [DashboardService, ReportService],
})
export class AdminPanelModule {}
