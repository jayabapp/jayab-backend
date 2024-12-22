import { Module } from '@nestjs/common';
import { BannerAdminModule } from './roles/admin/admin.module';
import { BannerUserModule } from './roles/user/user.module';

@Module({
  imports: [BannerAdminModule, BannerUserModule],
})
export class BannerModule {}
