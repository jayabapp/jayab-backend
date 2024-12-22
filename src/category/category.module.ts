import { Module } from '@nestjs/common';
import { CategoryAdminModule } from './roles/admin/category-admin.module';
import { CategoryUserModule } from './roles/user/category-user.module';

@Module({
  imports: [CategoryAdminModule, CategoryUserModule],
})
export class CategoryModule {}
