import { Module } from '@nestjs/common';
import { PropertyReportAdminModule } from './roles/admin/admin.module';
import { PropertyReportUserModule } from './roles/user/user.module';
//@owner import { PropertyReportOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    PropertyReportAdminModule,
    PropertyReportUserModule,
    //@owner PropertyReportOwnerModule
  ],
})
export class PropertyReportModule {}
