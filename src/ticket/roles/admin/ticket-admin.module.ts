import { Module } from '@nestjs/common';
import { TicketAdminService } from './ticket-admin.service';
import { TicketAdminController } from './ticket-admin.controller';

@Module({
  controllers: [TicketAdminController],
  providers: [TicketAdminService],
})
export class TicketAdminModule {}
