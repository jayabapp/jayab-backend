import { PropertyReserveUserController } from './user.controller';
import { PropertyReserveUserService } from './user.service';
import { ReserveQueueProcessor } from 'src/property-reserve/processors/reserve.queue';
import { PropertySerializer } from 'src/property/serializer/property.serializer';
import { PropertyUserModule } from 'src/property/roles/user/user.module';
import { RESERVE_QUEUE } from 'src/property-reserve/processors/queue-name.constants';
import { BullModule } from '@nestjs/bull';
import { DayHelper } from 'src/common/helpers/day.helper';
import { Module } from '@nestjs/common';

@Module({
  imports: [BullModule.registerQueue({ name: RESERVE_QUEUE }), PropertyUserModule],
  controllers: [PropertyReserveUserController],
  providers: [PropertyReserveUserService, ReserveQueueProcessor, PropertySerializer, DayHelper],
})
export class PropertyReserveUserModule {}
