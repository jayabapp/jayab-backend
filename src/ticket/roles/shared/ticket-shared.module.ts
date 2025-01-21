import { Module } from '@nestjs/common';
import { TicketSharedController } from './ticket-shared.controller';
import { TicketSharedService } from './ticket-shared.service';

@Module({
  controllers: [TicketSharedController],
  providers: [TicketSharedService],
})
export class TicketSharedModule {}
