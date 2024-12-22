import { Module } from '@nestjs/common';
import { BannerUserController } from './user.controller';
import { BannerUserService } from './user.service';

@Module({
  controllers: [BannerUserController],
  providers: [BannerUserService],
})
export class BannerUserModule {}
