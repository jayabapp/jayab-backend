import { Module } from '@nestjs/common';
import { PropertyReserveUserController } from './user.controller';
import { PropertyReserveUserService } from './user.service';
import { BullModule } from '@nestjs/bull';
import { RESERVE_QUEUE } from 'src/property-reserve/processors/queue-name.constants';
import { ReserveQueueProcessor } from 'src/property-reserve/processors/reserve.queue';
import { PropertySerializer } from 'src/property/serializer/property.serializer';
import { DayHelper } from 'src/common/helpers/day.helper';

@Module({
  imports: [BullModule.registerQueue({ name: RESERVE_QUEUE })],
  controllers: [PropertyReserveUserController],
  providers: [PropertyReserveUserService, ReserveQueueProcessor, PropertySerializer, DayHelper],
})
export class PropertyReserveUserModule {}
