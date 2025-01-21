import { Controller, Get, Post, Body, UseGuards, Req, ParseIntPipe, Query, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { RequestType } from 'src/common/interfaces/user.interface';
import { TICKET_ROUTE_GROUP } from '../../common/route-group.constant';
import { TicketSharedService } from './ticket-shared.service';
import { SocketService } from 'src/socket/socket.service';
import { random } from 'lodash';

@ApiTags('Ticket - User')
@ApiBearerAuth('user-jwt')
@UseGuards(UserJwtGuard)
@Controller(TICKET_ROUTE_GROUP)
export class TicketSharedController {
  constructor(
    private readonly ticketSharedService: TicketSharedService,
    private readonly socketService: SocketService,
  ) {}

  @ApiOperation({ operationId: 'Add' })
  @Post()
  async create(@Req() request: RequestType, @Body() dto: CreateTicketDto): Promise<SuccessResponseArgs> {
    const userId = request.user.id;
    const { ticket, user } = await this.ticketSharedService.create(userId, dto);

    this.socketService.emitToAdmins({
      event: 'NewTicket',
      id: random(0, 100_000_000),
      title: 'تیکت جدید',
      body: `تیکت جدید توسط ${user.full_name} ایجاد شده است`,
      type: 'info',
      route: `/tickets/show/${ticket.id}`,
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
    const result = await this.ticketSharedService.findAll(user.id, page);

    return { result };
  }

  @ApiOperation({ operationId: 'Find one', description: '' })
  @Get(':id')
  async findOne(
    @Req() request: RequestType,
    @Param('id', ParseIntPipe) ticketId: number,
  ): Promise<SuccessResponseArgs> {
    const { user } = request;
    const result = await this.ticketSharedService.findOne(user.id, ticketId);

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
    await this.ticketSharedService.replyTicket(user.id, ticketId, dto);

    this.socketService.emitToAdmins({
      event: 'NewTicket',
      id: random(0, 100_000_000),
      title: 'پاسخ تیکت',
      body: `تیکت شماره ${ticketId} توسط کاربر پاسخ داده شد و منتظر پاسخ شماست`,
      type: 'info',
      route: `/tickets/show/${ticketId}`,
    });
    return { messageCode: 'TICKET_REPLY_SUBMITED_SUCCESSFULLY' };
  }
}
