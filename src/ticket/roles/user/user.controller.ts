import { Controller, Get, Post, Body, UseGuards, Req, ParseIntPipe, Query, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTicketDto } from '../../common/dto/create-ticket.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { ReplyTicketDto } from '../../common/dto/reply-ticket.dto';
import { RequestType } from 'src/common/interfaces/user.interface';
import { USER_TICKET_ROUTE_GROUP } from '../../common/route-group.constant';
import { SocketService } from 'src/socket/socket.service';
import { random } from 'lodash';
import { TicketSharedService } from '../shared/ticket-shared.service';
import { UserRole } from 'src/common/interfaces/role.enum';
import { User } from '@prisma/client';
import { NotificationSharedService } from 'src/notification/roles/shared/shared.service';
import { NotificationTypes } from 'src/firebase/constants/notif-types';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';

@ApiTags('Ticket - USER')
@ApiBearerAuth('user-jwt')
@UseGuards(UserJwtGuard)
@Controller(USER_TICKET_ROUTE_GROUP)
export class TicketUserController {
  constructor(
    private readonly ticketSharedService: TicketSharedService,
    private readonly notificationService: NotificationSharedService,
  ) {}

  @ApiOperation({ operationId: 'Create' })
  @Post()
  async create(@Req() request: RequestType, @Body() dto: CreateTicketDto): Promise<SuccessResponseArgs> {
    const userId = request.user.id;
    const { ticket, user } = await this.ticketSharedService.create(userId, dto);

    await this.notificationService.createNotification({
      user: { id: null, role: UserRole.ADMIN },
      mustSendNotif: true,
      notification: {
        title: 'تیکت جدید',
        body: `تیکت جدید توسط ${user.full_name} ایجاد شده است`,
      },
      notificationType: NotificationTypes.NEW_TICKET,
      notificationableId: ticket.id.toString(),
    });

    return { messageCode: 'TICKET_SUBMITED_SUCCESSFULLY' };
  }

  @ApiOperation({ operationId: 'Find all' })
  @Get()
  async findAll(
    @Req() request: RequestType,
    @Query('page', ParseIntPipe) page: number,
  ): Promise<SuccessResponseArgs> {
    const { user } = request;
    const result = await this.ticketSharedService.findAll(user, page);

    return { result };
  }

  @ApiOperation({ operationId: 'Find one', description: '' })
  @Get(':id')
  async findOne(
    @Req() request: RequestType,
    @Param('id', ParseIntPipe) ticketId: number,
  ): Promise<SuccessResponseArgs> {
    const { user } = request;
    const result = await this.ticketSharedService.findOne(user, ticketId);

    return { result };
  }

  @ApiOperation({ operationId: 'Reply', description: '' })
  @Post(':id')
  async replyTicket(
    @Req() request: RequestType,
    @Param('id', ParseIntPipe) ticketId: number,
    @Body() dto: ReplyTicketDto,
  ): Promise<SuccessResponseArgs> {
    const { user } = request;
    const updatedTicket = await this.ticketSharedService.replyTicket(user, ticketId, dto);

    await this.notificationService.createNotification({
      user: { id: null, role: UserRole.ADMIN },
      mustSendNotif: true,
      notification: {
        title: 'پاسخ تیکت',
        body: `تیکت شماره ${updatedTicket.id} پاسخ داده شد`,
      },
      notificationType: NotificationTypes.NEW_TICKET,
      notificationableId: updatedTicket.id.toString(),
    });
    return { messageCode: 'TICKET_REPLY_SUBMITED_SUCCESSFULLY' };
  }
}
