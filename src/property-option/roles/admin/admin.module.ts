import { Module } from '@nestjs/common';
import { PropertyOptionAdminController } from './admin.controller';
import { PropertyOptionAdminService } from './admin.service';

@Module({
  controllers: [PropertyOptionAdminController],
  providers: [PropertyOptionAdminService],
})
export class PropertyOptionAdminModule {}
