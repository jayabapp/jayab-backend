import { Module } from '@nestjs/common';
import { AuthUserController } from './auth-user.controller';
import { AuthUserService } from './auth-user.service';
import { SmsModule } from 'src/sms/sms.module';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { AuthSharedService } from 'src/auth/auth-shared.service';

@Module({
  imports: [SmsModule, AttachmentModule],
  controllers: [AuthUserController],
  providers: [AuthUserService, AuthSharedService],
})
export class UserModule {}
