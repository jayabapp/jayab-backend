import { Module } from '@nestjs/common';
import { PaymentUserController } from './user.controller';
import { PaymentUserService } from './user.service';
import { SmsModule } from 'src/sms/sms.module';
import { PaymentGatewayUserModule } from 'src/payment-gateway/roles/user/user.module';

@Module({
  imports: [SmsModule, PaymentGatewayUserModule],
  controllers: [PaymentUserController],
  providers: [PaymentUserService],
  exports: [PaymentUserService],
})
export class PaymentUserModule {}
