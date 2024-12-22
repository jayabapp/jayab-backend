import { Module } from '@nestjs/common';
import { ContentCategoryAdminController } from './admin.controller';
import { ContentCategoryAdminService } from './admin.service';

@Module({
  controllers: [ContentCategoryAdminController],
  providers: [ContentCategoryAdminService],
})
export class ContentCategoryAdminModule {}
