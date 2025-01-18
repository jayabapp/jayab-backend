import { Module } from '@nestjs/common';
//@admin import { FavoriteAdminModule } from './roles/admin/admin.module';
import { FavoriteUserModule } from './roles/user/user.module';

@Module({
  imports: [
    //@admin FavoriteAdminModule,
    FavoriteUserModule,
  ],
})
export class FavoriteModule {}
