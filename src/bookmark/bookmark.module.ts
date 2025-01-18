import { Module } from '@nestjs/common';
//@admin import { BookmarkAdminModule } from './roles/admin/admin.module';
import { BookmarkUserModule } from './roles/user/bookmark.module';

@Module({
  imports: [
    //@admin BookmarkAdminModule,
    BookmarkUserModule,
  ],
})
export class BookmarkModule {}
