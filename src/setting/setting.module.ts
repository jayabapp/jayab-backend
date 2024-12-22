import { Module } from '@nestjs/common';
import { SettingAdminModule } from './roles/admin/admin.module';
import { SettingSharedController } from './roles/shared/shared.controller';

@Module({
  imports: [SettingAdminModule],
  controllers: [SettingSharedController],
})
export class SettingModule {}
