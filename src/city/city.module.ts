import { Module } from '@nestjs/common';
import { AdminModule } from './roles/admin/admin.module';
import { UserModule } from './roles/user/user.module';
import { CitySharedService } from './shared.service';

@Module({
  imports: [AdminModule, UserModule],
  providers: [CitySharedService],
})
export class CityModule {}
