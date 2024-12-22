import { Global, Module } from '@nestjs/common';
import { SettingAdminController } from './admin.controller';
import { SettingAdminService } from './admin.service';

@Global()
@Module({
  controllers: [SettingAdminController],
  providers: [SettingAdminService],
  exports: [SettingAdminService],
})
export class SettingAdminModule {}
