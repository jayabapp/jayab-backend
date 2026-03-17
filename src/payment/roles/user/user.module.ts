import { Module } from '@nestjs/common';
import { PaymentUserController } from './user.controller';
import { PaymentUserService } from './user.service';
import { SmsModule } from 'src/sms/sms.module';
import { PaymentGatewayUserModule } from 'src/payment-gateway/roles/user/user.module';
import { BullModule } from '@nestjs/bull';
import { PAYMENT_SMS_QUEUE } from 'src/payment/processors/queue-name.constants';
import { PaymentSmsQueueProcessor } from 'src/payment/processors/payment.queue';

@Module({
  imports: [BullModule.registerQueue({ name: PAYMENT_SMS_QUEUE }), SmsModule, PaymentGatewayUserModule],
  controllers: [PaymentUserController],
  providers: [PaymentUserService, PaymentSmsQueueProcessor],
  exports: [PaymentUserService],
})
export class PaymentUserModule {}
