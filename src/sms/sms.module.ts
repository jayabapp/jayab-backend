import { Global, Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { AvanakService } from './avanak.service';

@Global()
@Module({
  providers: [SmsService, AvanakService],
  exports: [SmsService, AvanakService],
})
export class SmsModule {}
