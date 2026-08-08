import { Module } from '@nestjs/common';
import { PaymentGatewayUserController } from './user.controller';
import { PaymentGatewayUserService } from './user.service';
import { ZarinpalService } from 'src/payment-gateway/gateways/zarinpal.service';
import { BazaarPayService } from 'src/payment-gateway/gateways/bazaarpay.service';

@Module({
  controllers: [PaymentGatewayUserController],
  providers: [PaymentGatewayUserService, ZarinpalService, BazaarPayService],
  exports: [PaymentGatewayUserService, ZarinpalService, BazaarPayService],
})
export class PaymentGatewayUserModule {}
