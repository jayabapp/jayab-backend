import { Module } from '@nestjs/common';
import { SubmittedFormAdminModule } from './roles/admin/admin.module';
import { SubmittedFormUserModule } from './roles/user/user.module';

@Module({
  imports: [
    SubmittedFormAdminModule,
    SubmittedFormUserModule
  ],
})
export class SubmittedFormModule {}
