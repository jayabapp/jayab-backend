import { Module } from '@nestjs/common';
import { LandingPageUserController } from './user.controller';
import { LandingPageUserService } from './user.service';
import { ContentSharedModule } from 'src/content/shared.module';

@Module({
  imports: [ContentSharedModule],
  controllers: [LandingPageUserController],
  providers: [LandingPageUserService],
})
export class LandingPageUserModule {}
