import { Module } from '@nestjs/common';
import { ProfileUserController } from './profile-user.controller';
import { ProfileUserService } from './profile-user.service';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { CategoryModule } from 'src/category/category.module';
import { OwnerUserModule } from 'src/owner/roles/user/user.module';

@Module({
  imports: [AttachmentModule, CategoryModule, OwnerUserModule],
  controllers: [ProfileUserController],
  providers: [ProfileUserService],
  exports: [ProfileUserService],
})
export class ProfileUserModule {}
