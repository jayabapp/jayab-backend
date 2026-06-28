import { Module } from '@nestjs/common';
import { AuthAdminService } from './auth-admin.service';
import { AuthAdminController } from './auth-admin.controller';
import { AuthSharedService } from 'src/auth/auth-shared.service';
import { SmsModule } from 'src/sms/sms.module';
import { AuthThrottlerGuard } from 'src/auth/guards/auth-throttler.guard';

@Module({
  imports: [SmsModule],
  providers: [AuthAdminService, AuthSharedService, AuthThrottlerGuard],
  controllers: [AuthAdminController],
})
export class AuthAdminModule {}
