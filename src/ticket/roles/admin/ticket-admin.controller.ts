import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  Param,
  Patch,
  Body,
  Delete,
  Put,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { TicketAdminService } from './ticket-admin.service';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { ReplyTicketDto } from '../shared/dto/reply-ticket.dto';
import { FindAllTicketAdminDto } from './dto/find-all-ticket-admin.dto';
import qs from 'qs';
import { AccessControlList } from '@prisma/client';
import { TICKET_ROUTE_GROUP } from '../../common/route-group.constant';
import { filterValidator } from 'src/ticket/common/helpers/filter-validator.helper';
import { NotificationSharedService } from 'src/notification/roles/shared/shared.service';
import { UserRole } from 'src/common/interfaces/role.enum';
import { NotificationTypes } from 'src/firebase/constants/notif-types';

@ApiTags('👨‍💻 Ticket - ADMIN')
@ApiBearerAuth('admin-jwt')
@UseGuards(AdminJwtGuard)
@Controller(`admin/${TICKET_ROUTE_GROUP}`)
export class TicketAdminController {
  constructor(
    private readonly ticketAdminService: TicketAdminService,
    private readonly notificationService: NotificationSharedService,
  ) {}

  /* -------------------------------- FIND ALL -------------------------------- */
  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllTicketAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.ticketAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }
  /* ------------------------------- MODEL PROPS ------------------------------ */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.ticketAdminService.findModelProps(rbac);
    return { result };
  }

  // show
  @ApiOperation({ summary: 'Find one', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) ticketId: number): Promise<SuccessResponseArgs> {
    const result = await this.ticketAdminService.findOne(ticketId);

    return { result };
  }

  // Reply
  @ApiOperation({ summary: 'Reply', description: '' })
  @Patch(':id')
  async replyTicket(
    @Param('id', ParseIntPipe) ticketId: number,
    @Body() dto: ReplyTicketDto,
  ): Promise<SuccessResponseArgs> {
    const updatedTicket = await this.ticketAdminService.replyTicket(ticketId, dto);

    await this.notificationService.createNotification({
      user: { id: updatedTicket?.user_id, role: UserRole.USER },
      mustSendNotif: true,
      notification: {
        title: 'پاسخ تیکت',
        body: `تیکت شما با عنوان ${updatedTicket.title} توسط ادمین پاسخ داده شد`,
      },
      notificationType: NotificationTypes.NEW_TICKET,
      notificationableId: updatedTicket?.id?.toString(),
    });

    return { messageCode: 'TICKET_REPLY_SUBMITED_SUCCESSFULLY' };
  }

  // Close
  @ApiOperation({ summary: 'Close ticket', description: '' })
  @Put(':id')
  async closeTicket(@Param('id', ParseIntPipe) ticketId: number): Promise<SuccessResponseArgs> {
    await this.ticketAdminService.closeTicket(ticketId);

    return { messageCode: 'TICKET_CLOSED_SUCCESSFULLY' };
  }

  // Delete
  @ApiOperation({ summary: 'Delete', description: '' })
  @Delete(':id')
  async deleteTicket(@Param('id', ParseIntPipe) ticketId: number): Promise<SuccessResponseArgs> {
    await this.ticketAdminService.deleteTicket(ticketId);

    return { messageCode: 'TICKET_DELETED_SUCCESSFULLY' };
  }
}
