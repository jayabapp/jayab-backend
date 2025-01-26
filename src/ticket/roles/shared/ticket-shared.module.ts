import { Module } from '@nestjs/common';
import { TicketSharedService } from './ticket-shared.service';

@Module({
  providers: [TicketSharedService],
})
export class TicketSharedModule {}
