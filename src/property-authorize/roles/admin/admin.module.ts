import { Module } from '@nestjs/common';
import { PropertyAuthorizeAdminController } from './admin.controller';
import { PropertyAuthorizeAdminService } from './admin.service';

@Module({
  controllers: [PropertyAuthorizeAdminController],
  providers: [PropertyAuthorizeAdminService],
})
export class PropertyAuthorizeAdminModule {}
