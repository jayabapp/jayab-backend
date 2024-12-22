import { Module } from '@nestjs/common';
import { FormBuilderAdminModule } from './roles/admin/admin.module';

@Module({
  imports: [FormBuilderAdminModule],
})
export class FormBuilderModule {}
