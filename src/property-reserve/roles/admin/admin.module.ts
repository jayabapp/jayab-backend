import { Module } from '@nestjs/common';
import { PropertyReserveAdminController } from './admin.controller';
import { PropertyReserveAdminService } from './admin.service';

@Module({
  controllers: [PropertyReserveAdminController],
  providers: [PropertyReserveAdminService],
})
export class PropertyReserveAdminModule {}
