import { Module } from '@nestjs/common';
import { LandingPageAdminModule } from './roles/admin/admin.module';
import { LandingPageUserModule } from './roles/user/user.module';

@Module({
  imports: [
    LandingPageAdminModule,
    LandingPageUserModule
  ],
})
export class LandingPageModule {}
