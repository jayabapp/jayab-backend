import { CALL_LOG_QUEUE, VIEW_COUNT_QUEUE } from 'src/property/processors/queue-name.constants';
import { ViewCountQueueProcessor } from 'src/property/processors/view-count.queue';
import { PropertyUserController } from './user.controller';
import { CallLogQueueProcessor } from 'src/property/processors/call-log.queue';
import { PropertyUserService } from './user.service';
import { PropertyOwnerModule } from '../owner/owner.module';
import { PropertySerializer } from 'src/property/serializer/property.serializer';
import { ProfileUserModule } from 'src/profile/roles/user/profile-user.module';
import { BullModule } from '@nestjs/bull';
import { DayHelper } from 'src/common/helpers/day.helper';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    BullModule.registerQueue({ name: CALL_LOG_QUEUE }),
    BullModule.registerQueue({ name: VIEW_COUNT_QUEUE }),
    ProfileUserModule,
    PropertyOwnerModule,
    ProfileUserModule,
  ],
  controllers: [PropertyUserController],
  providers: [
    DayHelper,
    PropertySerializer,
    PropertyUserService,
    CallLogQueueProcessor,
    ViewCountQueueProcessor,
  ],
  exports: [PropertyUserService],
})
export class PropertyUserModule {}
