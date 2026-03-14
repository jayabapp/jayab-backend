import { Module } from '@nestjs/common';
import { PropertyReserveOwnerController } from './owner.controller';
import { PropertyReserveOwnerService } from './owner.service';
import { BullModule } from '@nestjs/bull';
import { RESERVE_QUEUE } from 'src/property-reserve/processors/queue-name.constants';
import { ReserveQueueProcessor } from 'src/property-reserve/processors/reserve.queue';

@Module({
  controllers: [PropertyReserveOwnerController],
  providers: [PropertyReserveOwnerService],
})
export class PropertyReserveOwnerModule {}
