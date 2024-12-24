import { Module } from '@nestjs/common';
import { ProfileAdminModule } from './roles/admin/profile-admin.module';
import { ProfileUserModule } from './roles/user/profile-user.module';

@Module({
  imports: [ProfileAdminModule, ProfileUserModule],
})
export class ProfileModule {}
