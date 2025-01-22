import { Module } from '@nestjs/common';
import { TicketAdminModule } from './roles/admin/ticket-admin.module';
import { TicketSharedService } from './roles/shared/ticket-shared.service';
import { TicketSharedModule } from './roles/shared/ticket-shared.module';

@Module({
  imports: [TicketSharedModule, TicketAdminModule],
  providers: [TicketSharedService],
})
export class TicketModule {}
