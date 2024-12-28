import { Module } from '@nestjs/common';
import { CityAdminService } from './city-admin.service';
import { CityAdminController } from './city-admin.controller';

@Module({
  controllers: [CityAdminController],
  providers: [CityAdminService],
  exports: [CityAdminService],
})
export class CityAdminModule {}
