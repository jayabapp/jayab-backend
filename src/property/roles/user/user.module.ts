import { Module } from '@nestjs/common';
import { PropertyUserService } from './user.service';
import { PropertyUserController } from './user.controller';
import { PropertySerializer } from 'src/property/serializer/property.serializer';
import { DayHelper } from 'src/common/helpers/day.helper';
import { ProfileUserModule } from 'src/profile/roles/user/profile-user.module';
import { PropertyOwnerModule } from '../owner/owner.module';
import { BullModule } from '@nestjs/bull';
import { CALL_LOG_QUEUE, VIEW_COUNT_QUEUE } from 'src/property/processors/queue-name.constants';
import { CallLogQueueProcessor } from 'src/property/processors/call-log.queue';
import { ViewCountQueueProcessor } from 'src/property/processors/view-count.queue';

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
    PropertyUserService,
    PropertySerializer,
    DayHelper,
    CallLogQueueProcessor,
    ViewCountQueueProcessor,
  ],
  exports: [PropertyUserService],
})
export class PropertyUserModule {}
