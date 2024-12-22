import { Module } from '@nestjs/common';
import { ContentAdminController } from './admin.controller';
import { ContentAdminService } from './admin.service';

@Module({
  controllers: [ContentAdminController],
  providers: [ContentAdminService],
})
export class ContentAdminModule {}
