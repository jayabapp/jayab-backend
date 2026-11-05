import { SubscriptionPlanUserModule } from 'src/subscription-plan/roles/user/user.module';
import { PropertyOwnerController } from './owner.controller';
import { PropertyOwnerService } from './owner.service';
import { PropertySerializer } from 'src/property/serializer/property.serializer';
import { PaymentUserModule } from 'src/payment/roles/user/user.module';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { DayHelper } from 'src/common/helpers/day.helper';
import { Module } from '@nestjs/common';

@Module({
  imports: [AttachmentModule, SubscriptionPlanUserModule, PaymentUserModule],
  controllers: [PropertyOwnerController],
  providers: [PropertyOwnerService, PropertySerializer, DayHelper],
  exports: [PropertyOwnerService],
})
export class PropertyOwnerModule {}
