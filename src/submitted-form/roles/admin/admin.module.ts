import { Module } from '@nestjs/common';
import { SubmittedFormAdminController } from './admin.controller';
import { SubmittedFormAdminService } from './admin.service';

@Module({
  controllers: [SubmittedFormAdminController],
  providers: [SubmittedFormAdminService],
})
export class SubmittedFormAdminModule {}
