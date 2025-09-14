import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PageSeoAnalyzeAdminModule } from 'src/page-seo-analyze/roles/admin/admin.module';

@Module({
  imports: [PageSeoAnalyzeAdminModule],
  providers: [TasksService],
})
export class TasksModule {}
