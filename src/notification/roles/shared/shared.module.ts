import { Global, Module } from '@nestjs/common';
import { NotificationSharedService } from './shared.service';

@Global()
@Module({
  providers: [NotificationSharedService],
  exports: [NotificationSharedService],
})
export class NotificationSharedModule {}
