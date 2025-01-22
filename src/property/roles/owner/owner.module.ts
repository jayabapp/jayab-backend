import { Module } from '@nestjs/common';
import { PropertyOwnerService } from './owner.service';
import { PropertyOwnerController } from './owner.controller';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { SubscriptionPlanUserModule } from 'src/subscription-plan/roles/user/user.module';
import { PaymentUserModule } from 'src/payment/roles/user/user.module';
import { DayHelper } from 'src/common/helpers/day.helper';
import { PropertySerializer } from 'src/property/serializer/property.serializer';

@Module({
  imports: [AttachmentModule, SubscriptionPlanUserModule, PaymentUserModule],
  controllers: [PropertyOwnerController],
  providers: [PropertyOwnerService, PropertySerializer, DayHelper],
  exports: [PropertyOwnerService],
})
export class PropertyOwnerModule {}
