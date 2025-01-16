import { Module } from '@nestjs/common';
import { LandingPageAdminModule } from './roles/admin/admin.module';
//@user import { LandingPageUserModule } from './roles/user/user.module';
//@owner import { LandingPageOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    LandingPageAdminModule,
    //@user LandingPageUserModule
    //@owner LandingPageOwnerModule
  ],
})
export class LandingPageModule {}
