import { Module } from '@nestjs/common';
import { PaymentGatewayAdminModule } from './roles/admin/admin.module';
import { PaymentGatewayUserModule } from './roles/user/user.module';

@Module({
  imports: [
    PaymentGatewayAdminModule,
    PaymentGatewayUserModule
  ],
})
export class PaymentGatewayModule {}
