import { Module } from '@nestjs/common';
import { PropertyReserveOwnerController } from './owner.controller';
import { PropertyReserveOwnerService } from './owner.service';

@Module({
  controllers: [PropertyReserveOwnerController],
  providers: [PropertyReserveOwnerService],
})
export class PropertyReserveOwnerModule {}
