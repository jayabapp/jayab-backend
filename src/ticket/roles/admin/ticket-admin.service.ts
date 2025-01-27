import { Ticket, Prisma, AccessControlList } from '@prisma/client';
import { type PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ReplyTicketDto } from '../shared/dto/reply-ticket.dto';
import {
  Column,
  CreateProps,
  FilterProps,
  OperatorItems,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { TicketCommonStatuses } from '../../common/ticket-status.constant';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  tablePropsBuilder,
} from 'src/ticket/common/helpers/model-props-builder.helper';

enum RefEnum {
  icon = 'icon',
}
// image = 'image',
// category = 'category',

type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.TicketScalarFieldEnum;

type ModifiedFilterProps = FilterProps & { key: ModelFields };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

@Injectable()
export class TicketAdminService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all Service
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(filters: object, page: number, perPage = 50): Promise<PaginatedResult<Ticket>> {
    const list = await paginate()<Ticket, Prisma.TicketFindManyArgs>(
      this.db.ticket,
      { where: filters },
      { page, perPage: perPage || 50 },
    );

    return list;
  }

  // Show
  async findOne(ticketId: number): Promise<Ticket> {
    const ticket = await this.db.ticket.findUnique({
      where: { id: ticketId },
      include: { user: true, replies: true },
    });

    if (!ticket) throw new NotFoundException('NOT_FOUND');

    return ticket;
  }

  // Reply ticket
  async replyTicket(ticketId: number, dto: ReplyTicketDto): Promise<Ticket> {
    const ticket = await this.db.ticket.findUnique({ where: { id: ticketId } });

    if (!ticket) throw new NotFoundException('NOT_FOUND');

    // Save reply
    await this.db.ticketReplies.create({
      data: { ticket_id: ticketId, message: dto.message, by_admin: true },
    });

    // Change ticket status to REPLIED
    const updatedTicket = await this.db.ticket.update({
      where: { id: ticket.id },
      data: { status: TicketCommonStatuses.REPLIED },
    });
    return updatedTicket;
  }

  // Close ticket
  async closeTicket(ticketId: number): Promise<Ticket> {
    const ticket = await this.db.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (ticket === null) throw new NotFoundException('NOT_FOUND');

    // Change ticket status to CLOSED
    await this.db.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        status: TicketCommonStatuses.CLOSED,
      },
    });
    return ticket;
  }

  // Delete ticket
  async deleteTicket(ticketId: number): Promise<void> {
    const ticket = await this.db.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (!ticket) throw new NotFoundException('NOT_FOUND');

    await this.db.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticket.id },
        data: { replies: { deleteMany: { ticket_id: ticketId } } },
      });

      await tx.ticket.delete({ where: { id: ticketId } });
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPER                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find model props
   * @param rbac
   * @returns
   */
  async findModelProps(rbac: AccessControlList): Promise<{
    filterProps: Array<CreateProps>;
    createProps: Array<CreateProps>;
    tableProps: TableProps;
    operators: Array<OperatorItems>;
  }> {
    // ACTIONS
    const availableActions = allActionsBuilder(rbac);

    // PROPS
    const filterProps = filterPropsBuilder();
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder();

    return { operators: operatorsList, filterProps, createProps, tableProps };
  }
}
