import { Module } from '@nestjs/common';
import { PropertyReserveOwnerController } from './owner.controller';
import { PropertyReserveOwnerService } from './owner.service';
import { BullModule } from '@nestjs/bull';
import { RESERVE_QUEUE } from 'src/property-reserve/processors/queue-name.constants';
import { ReserveQueueProcessor } from 'src/property-reserve/processors/reserve.queue';
import { PropertySerializer } from 'src/property/serializer/property.serializer';
import { DayHelper } from 'src/common/helpers/day.helper';

@Module({
  controllers: [PropertyReserveOwnerController],
  providers: [PropertyReserveOwnerService, PropertySerializer, DayHelper],
})
export class PropertyReserveOwnerModule {}
