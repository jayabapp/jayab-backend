import { Module } from '@nestjs/common';
import { BookmarkUserController } from './bookmark.controller';
import { BookmarkUserService } from './bookmark.service';
import { PropertyUserModule } from 'src/property/roles/user/user.module';

@Module({
  imports: [PropertyUserModule],
  controllers: [BookmarkUserController],
  providers: [BookmarkUserService],
})
export class BookmarkUserModule {}
