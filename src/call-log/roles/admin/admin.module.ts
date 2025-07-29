import { Module } from '@nestjs/common';
import { CallLogAdminController } from './admin.controller';
import { CallLogAdminService } from './admin.service';

@Module({
  controllers: [CallLogAdminController],
  providers: [CallLogAdminService],
})
export class CallLogAdminModule {}
