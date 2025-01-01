import { Module } from '@nestjs/common';
import { PaymentGatewayAdminController } from './admin.controller';
import { PaymentGatewayAdminService } from './admin.service';

@Module({
  controllers: [PaymentGatewayAdminController],
  providers: [PaymentGatewayAdminService],
  exports: [PaymentGatewayAdminService],
})
export class PaymentGatewayAdminModule {}
