import { Module } from '@nestjs/common';
import { CategoryAdminService } from './category-admin.service';
import { CategoryAdminController } from './category-admin.controller';

@Module({
  controllers: [CategoryAdminController],
  providers: [CategoryAdminService],
  exports: [CategoryAdminService],
})
export class CategoryAdminModule {}
