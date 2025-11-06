import { Module } from '@nestjs/common';
import { RedirectUrlAdminModule } from './roles/admin/admin.module';
import { RedirectUrlUserModule } from './roles/user/user.module';

@Module({
  imports: [
    RedirectUrlAdminModule,
    RedirectUrlUserModule
  ],
})
export class RedirectUrlModule {}
