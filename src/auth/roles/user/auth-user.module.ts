import { AuthUserController } from './auth-user.controller';
import { FavoriteUserModule } from 'src/favorite/roles/user/user.module';
import { BookmarkUserModule } from 'src/bookmark/roles/user/bookmark.module';
import { AuthThrottlerGuard } from 'src/auth/guards/auth-throttler.guard';
import { ProfileUserModule } from 'src/profile/roles/user/profile-user.module';
import { AuthSharedService } from 'src/auth/auth-shared.service';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { TestAccessModule } from 'src/test-access/test-access.module';
import { AuthUserService } from './auth-user.service';
import { SmsModule } from 'src/sms/sms.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    SmsModule,
    AttachmentModule,
    FavoriteUserModule,
    BookmarkUserModule,
    ProfileUserModule,
    TestAccessModule,
  ],
  controllers: [AuthUserController],
  providers: [AuthUserService, AuthSharedService, AuthThrottlerGuard],
})
export class UserModule {}
