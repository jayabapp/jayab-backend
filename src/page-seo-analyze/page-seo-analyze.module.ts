import { Module } from '@nestjs/common';
import { PageSeoAnalyzeAdminModule } from './roles/admin/admin.module';
//@user import { PageSeoAnalyzeUserModule } from './roles/user/user.module';

@Module({
  imports: [
    PageSeoAnalyzeAdminModule,
    //@user PageSeoAnalyzeUserModule
  ],
})
export class PageSeoAnalyzeModule {}
