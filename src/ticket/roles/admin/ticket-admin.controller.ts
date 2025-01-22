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
} from '@nestjs/common';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { TicketAdminService } from './ticket-admin.service';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { ReplyTicketDto } from '../shared/dto/reply-ticket.dto';
import { FindAllTicketAdminDto } from './dto/find-all-ticket-admin.dto';
import qs from 'qs';
import { AccessControlList } from '@prisma/client';
import { TICKET_ROUTE_GROUP } from '../../common/route-group.constant';

@ApiTags('👨‍💻 Ticket - ADMIN')
@ApiBearerAuth('admin-jwt')
@UseGuards(AdminJwtGuard)
@Controller(`admin/${TICKET_ROUTE_GROUP}`)
export class TicketAdminController {
  constructor(private readonly ticketAdminService: TicketAdminService) {}

  /* -------------------------------- FIND ALL -------------------------------- */
  @ApiOperation({ operationId: 'Find All', description: '' })
  @ApiQuery({
    name: 'filters',
    required: false,
    type: 'string',
    example: 'filters[title][contains]=titleName',
    description: 'filters[field][operator]=value',
  })
  @Get()
  async findAll(@Query() dto: FindAllTicketAdminDto): Promise<SuccessResponseArgs> {
    if (typeof dto.filters === 'string') {
      const parsedFilters = qs.parse(dto.filters, {
        parameterLimit: 10, // Adjust this limit as needed
      });

      dto.filters = parsedFilters.filters;
    }

    await this.ticketAdminService.validateFilters(dto.filters);
    const result = await this.ticketAdminService.findAll(dto);

    return { result };
  }

  /* ------------------------------- MODEL PROPS ------------------------------ */
  @ApiOperation({ operationId: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;

    const result = await this.ticketAdminService.findModelProps(rbac);

    return { result };
  }

  // show
  @ApiOperation({ operationId: 'Find one', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) ticketId: number): Promise<SuccessResponseArgs> {
    const result = await this.ticketAdminService.findOne(ticketId);

    return { result };
  }

  // Reply
  @ApiOperation({ operationId: 'Reply', description: '' })
  @Patch(':id')
  async replyTicket(
    @Param('id', ParseIntPipe) ticketId: number,
    @Body() dto: ReplyTicketDto,
  ): Promise<SuccessResponseArgs> {
    await this.ticketAdminService.replyTicket(ticketId, dto);

    return { messageCode: 'TICKET_REPLY_SUBMITED_SUCCESSFULLY' };
  }

  // Close
  @ApiOperation({ operationId: 'Close ticket', description: '' })
  @Put(':id')
  async closeTicket(@Param('id', ParseIntPipe) ticketId: number): Promise<SuccessResponseArgs> {
    await this.ticketAdminService.closeTicket(ticketId);

    return { messageCode: 'TICKET_CLOSED_SUCCESSFULLY' };
  }

  // Delete
  @ApiOperation({ operationId: 'Delete', description: '' })
  @Delete(':id')
  async deleteTicket(@Param('id', ParseIntPipe) ticketId: number): Promise<SuccessResponseArgs> {
    await this.ticketAdminService.deleteTicket(ticketId);

    return { messageCode: 'TICKET_DELETED_SUCCESSFULLY' };
  }
}
