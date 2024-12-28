import { Module } from '@nestjs/common';
import { CityAdminModule } from './roles/admin/city-admin.module';
import { CityUserModule } from './roles/user/user.module';
import { CitySharedService } from './shared.service';

@Module({
  imports: [CityAdminModule, CityUserModule],
  providers: [CitySharedService],
  exports: [CitySharedService],
})
export class CityModule {}
