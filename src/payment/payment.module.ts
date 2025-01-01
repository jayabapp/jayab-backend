import { Module } from '@nestjs/common';
//@admin import { PaymentAdminModule } from './roles/admin/admin.module';
import { PaymentUserModule } from './roles/user/user.module';

@Module({
  imports: [
    //@admin PaymentAdminModule,
    PaymentUserModule,
  ],
})
export class PaymentModule {}
