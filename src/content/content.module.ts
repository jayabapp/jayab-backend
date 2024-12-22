import { Module } from '@nestjs/common';
import { ContentAdminModule } from './roles/admin/admin.module';
import { ContentSharedModule } from './shared.module';

@Module({
  imports: [ContentAdminModule, ContentSharedModule],
})
export class ContentModule {}
