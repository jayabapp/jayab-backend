import { Module } from '@nestjs/common';
import { BaseAdminController } from './admin.controller';
import { BaseAdminService } from './admin.service';

@Module({
  controllers: [BaseAdminController],
  providers: [BaseAdminService],
})
export class BaseAdminModule {}
