import { Module } from '@nestjs/common';
import { CityUserController } from './user.controller';
import { CitySharedService } from 'src/city/shared.service';

@Module({
  controllers: [CityUserController],
  providers: [CitySharedService],
})
export class UserModule {}
