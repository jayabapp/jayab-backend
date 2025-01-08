import { Module } from '@nestjs/common';
import { PeakDayAdminModule } from './roles/admin/admin.module';
//@user import { PeakDayUserModule } from './roles/user/user.module';
//@owner import { PeakDayOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    PeakDayAdminModule,
    //@user PeakDayUserModule
    //@owner PeakDayOwnerModule
  ],
})
export class PeakDayModule {}
