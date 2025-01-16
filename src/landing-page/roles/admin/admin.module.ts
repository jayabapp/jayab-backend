import { Module } from '@nestjs/common';
import { LandingPageAdminController } from './admin.controller';
import { LandingPageAdminService } from './admin.service';

@Module({
  controllers: [LandingPageAdminController],
  providers: [LandingPageAdminService],
})
export class LandingPageAdminModule {}
