import { Module } from '@nestjs/common';
import { PropertyReservedDaysOwnerController } from './owner.controller';
import { PropertyReservedDaysOwnerService } from './owner.service';

@Module({
  controllers: [PropertyReservedDaysOwnerController],
  providers: [PropertyReservedDaysOwnerService],
})
export class PropertyReservedDaysOwnerModule {}
