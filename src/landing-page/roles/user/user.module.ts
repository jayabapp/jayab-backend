import { Module } from '@nestjs/common';
import { LandingPageUserController } from './user.controller';
import { LandingPageUserService } from './user.service';

@Module({
  controllers: [LandingPageUserController],
  providers: [LandingPageUserService],
})
export class LandingPageUserModule {}
