import { Module } from '@nestjs/common';
import { PropertyAdminController } from './admin.controller';
import { PropertyAdminService } from './admin.service';

@Module({
  controllers: [PropertyAdminController],
  providers: [PropertyAdminService],
})
export class PropertyAdminModule {}
