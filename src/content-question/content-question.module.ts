import { Module } from '@nestjs/common';
import { ContentQuestionAdminModule } from './roles/admin/admin.module';
import { ContentQuestionUserModule } from './roles/user/user.module';

@Module({
  imports: [
    ContentQuestionAdminModule,
    ContentQuestionUserModule
  ],
})
export class ContentQuestionModule {}
