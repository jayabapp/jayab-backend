import { Module } from '@nestjs/common';
import { ContentCategoryAdminModule } from './roles/admin/admin.module';
//@user import { ContentCategoryUserModule } from './roles/user/user.module';

@Module({
  imports: [
    ContentCategoryAdminModule,
    //@user ContentCategoryUserModule
  ],
})
export class ContentCategoryModule {}
