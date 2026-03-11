import { Module } from '@nestjs/common';
import { PropertyReserveUserController } from './user.controller';
import { PropertyReserveUserService } from './user.service';
import { BullModule } from '@nestjs/bull';
import { RESERVE_QUEUE } from 'src/property-reserve/processors/queue-name.constants';
import { ReserveQueueProcessor } from 'src/property-reserve/processors/reserve.queue';

@Module({
  imports: [BullModule.registerQueue({ name: RESERVE_QUEUE })],
  controllers: [PropertyReserveUserController],
  providers: [PropertyReserveUserService, ReserveQueueProcessor],
})
export class PropertyReserveUserModule {}
