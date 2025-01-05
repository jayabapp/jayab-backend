import { Module } from '@nestjs/common';
import { PropertyAuthorizedAdminController } from './admin.controller';
import { PropertyAuthorizedAdminService } from './admin.service';

@Module({
  controllers: [PropertyAuthorizedAdminController],
  providers: [PropertyAuthorizedAdminService],
})
export class PropertyAuthorizedAdminModule {}
