import { Module } from '@nestjs/common';
import { FormBuilderAdminController } from './admin.controller';
import { FormBuilderAdminService } from './admin.service';

@Module({
  controllers: [FormBuilderAdminController],
  providers: [FormBuilderAdminService],
})
export class FormBuilderAdminModule {}
