import { Module } from '@nestjs/common';
import { PageSeoAnalyzeAdminController } from './admin.controller';
import { PageSeoAnalyzeAdminService } from './admin.service';

@Module({
  controllers: [PageSeoAnalyzeAdminController],
  providers: [PageSeoAnalyzeAdminService],
  exports: [PageSeoAnalyzeAdminService]
})
export class PageSeoAnalyzeAdminModule { }
