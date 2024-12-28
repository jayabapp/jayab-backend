import { Module } from '@nestjs/common';
import { UserAdminModule } from './roles/admin/admin.module';
//@user import { UserUserModule } from './roles/user/user.module';

@Module({
  imports: [
    UserAdminModule,
    //@user UserUserModule
  ],
})
export class UserModule {}
