import { Module } from '@nestjs/common';
import { AuthUserController } from './auth-user.controller';
import { AuthUserService } from './auth-user.service';
import { SmsModule } from 'src/sms/sms.module';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { AuthSharedService } from 'src/auth/auth-shared.service';
import { FavoriteUserModule } from 'src/favorite/roles/user/user.module';
import { BookmarkUserModule } from 'src/bookmark/roles/user/bookmark.module';
import { ProfileUserModule } from 'src/profile/roles/user/profile-user.module';

@Module({
  imports: [SmsModule, AttachmentModule, FavoriteUserModule, BookmarkUserModule, ProfileUserModule],
  controllers: [AuthUserController],
  providers: [AuthUserService, AuthSharedService],
})
export class UserModule {}
