import { Module } from '@nestjs/common';
import { ProfileAdminService } from './profile-admin.service';
import { ProfileAdminController } from './profile-admin.controller';
import { AccessControlModule } from 'src/access-control/access-control.module';

@Module({
  imports: [AccessControlModule],
  providers: [ProfileAdminService],
  controllers: [ProfileAdminController],
})
export class ProfileAdminModule {}
