import { Module } from '@nestjs/common';
import { ProfileUserController } from './profile-user.controller';
import { ProfileUserService } from './profile-user.service';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [AttachmentModule, CategoryModule],
  controllers: [ProfileUserController],
  providers: [ProfileUserService],
  exports: [ProfileUserService],
})
export class ProfileUserModule {}
