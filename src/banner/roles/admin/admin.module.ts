import { Module } from '@nestjs/common';
import { BannerAdminController } from './admin.controller';
import { BannerAdminService } from './admin.service';
import { CategoryAdminModule } from 'src/category/roles/admin/category-admin.module';

@Module({
  imports: [CategoryAdminModule],
  controllers: [BannerAdminController],
  providers: [BannerAdminService],
})
export class BannerAdminModule {}
