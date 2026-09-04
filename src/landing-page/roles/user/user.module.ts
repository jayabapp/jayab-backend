import { LandingPageUserController } from './user.controller';
import { LandingPageUserService } from './user.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [LandingPageUserController],
  providers: [LandingPageUserService],
})
export class LandingPageUserModule {}
