import { Module } from '@nestjs/common';
import { RedirectUrlAdminController } from './admin.controller';
import { RedirectUrlAdminService } from './admin.service';

@Module({
  controllers: [RedirectUrlAdminController],
  providers: [RedirectUrlAdminService],
})
export class RedirectUrlAdminModule {}
