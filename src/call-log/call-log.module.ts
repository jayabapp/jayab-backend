import { Module } from '@nestjs/common';
import { CallLogAdminModule } from './roles/admin/admin.module';
//@user import { CallLogUserModule } from './roles/user/user.module';
//@owner import { CallLogOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    CallLogAdminModule,
    //@user CallLogUserModule
    //@owner CallLogOwnerModule
  ],
})
export class CallLogModule {}
