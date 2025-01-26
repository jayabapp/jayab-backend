import { Module } from "@nestjs/common";
import { TicketAdminModule } from "./roles/admin/ticket-admin.module";
import { TicketSharedService } from "./roles/shared/ticket-shared.service";
import { TicketSharedModule } from "./roles/shared/ticket-shared.module";
import { TicketUserController } from "./roles/user/user.controller";

@Module({
  imports: [TicketSharedModule, TicketAdminModule],
  controllers: [TicketUserController],
  providers: [TicketSharedService],
})
export class TicketModule {}
