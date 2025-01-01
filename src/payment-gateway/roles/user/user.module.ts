import { Module } from '@nestjs/common';
import { PaymentGatewayUserController } from './user.controller';
import { PaymentGatewayUserService } from './user.service';
import { ZarinpalService } from 'src/payment-gateway/gateways/zarinpal.service';

@Module({
  controllers: [PaymentGatewayUserController],
  providers: [PaymentGatewayUserService, ZarinpalService],
  exports: [PaymentGatewayUserService, ZarinpalService],
})
export class PaymentGatewayUserModule {}
