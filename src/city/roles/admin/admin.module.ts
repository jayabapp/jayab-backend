import { Module } from '@nestjs/common';
import { CityAdminController } from './admin.controller';
import { CityAdminService } from './admin.service';
import { CitySharedService } from 'src/city/shared.service';

@Module({
  controllers: [CityAdminController],
  providers: [CityAdminService, CitySharedService],
})
export class AdminModule {}
