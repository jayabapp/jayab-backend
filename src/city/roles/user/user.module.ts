import { Module } from '@nestjs/common';
import { CityUserController } from './user.controller';
import { CitySharedService } from '../../shared.service';

@Module({
  controllers: [CityUserController],
  providers: [CitySharedService],
  exports: [CitySharedService],
})
export class CityUserModule {}
