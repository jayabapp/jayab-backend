import { Module } from '@nestjs/common';
import { ContentQuestionAdminController } from './admin.controller';
import { ContentQuestionAdminService } from './admin.service';

@Module({
  controllers: [ContentQuestionAdminController],
  providers: [ContentQuestionAdminService],
})
export class ContentQuestionAdminModule {}
