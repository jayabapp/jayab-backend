import { Module } from '@nestjs/common';
import { AdvisorAdminModule } from './roles/admin/admin.module';
import { AdvisorUserModule } from './roles/user/user.module';

@Module({
  imports: [
    AdvisorAdminModule,
    AdvisorUserModule
  ],
})
export class AdvisorModule {}
