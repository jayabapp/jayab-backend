import { Ticket, Prisma, AccessControlList } from '@prisma/client';
import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ReplyTicketDto } from '../shared/dto/reply-ticket.dto';
import {
  AvailableAction,
  Column,
  CreateProps,
  FilterProps,
  OperatorItems,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operators, operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { FindAllTicketAdminDto } from './dto/find-all-ticket-admin.dto';
import { TicketCommonStatuses, TicketStatusList } from '../../common/ticket-status.constant';

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
  async findAll(dto: FindAllTicketAdminDto): Promise<PaginatedResult<Ticket>> {
    const { filters, page, per_page: perPage } = dto;

    const list = await paginate()<Ticket, Prisma.TicketFindManyArgs>(
      this.db.ticket,
      { where: filters },
      { page, perPage: perPage || 50 },
    );

    return list;
  }

  /**
   * validate filters
   * @param dto
   * @returns
   */
  async validateFilters(filters: object): Promise<object> {
    if (!filters) return {};

    let finalFilters = {};

    /**
     * get items for checking fields and operators
     * filter keys must be in items filerItems array
     * filter field keys must be in items operators array
     */
    const items = await this.filterProps();
    const fields = Object.keys(filters);

    for (const field of fields) {
      /**
       * check filter keys
       * ex:({ title: { equals: "test title" }, id: { gt: 1, lt: 10 } })
       */
      const checkField = items.find((e) => e.key === field);
      if (!checkField) throw new BadRequestException('FILTER1');

      /**
       * check operators of the key
       * ex:({ equals: "test title" })
       */
      const fieldOperators = Object.keys(filters[field]); //
      const finalOperators = { [field]: filters[field] };

      for (const operator of fieldOperators) {
        const checkOperator = checkField.operators?.find((e) => e.operator === operator);
        if (!checkOperator) throw new BadRequestException('FILTER2');

        // the type of value must be string or number. object, json and any other type are not valid
        let value = filters[field][operator];
        if (!value || value === '') throw new BadRequestException('FILTER2');
        if (!['string', 'number'].includes(typeof value)) throw new BadRequestException('');

        /**
         * if the value is number string, it must convert to the number type because of prisma query
         * the value type must exists in default operator types
         */
        if (!isNaN(value) && checkOperator.types.includes('number')) value = parseInt(value);
        if (!checkOperator?.types.includes(typeof value)) throw new BadRequestException();

        // create a new data using sanitized value
        finalOperators[field][operator] = value;
      }

      finalFilters = { ...finalFilters, ...finalOperators };
    }

    return finalFilters;
  }

  /**
   * find model props (filter items, model props, table items)
   * @returns
   */
  async findModelProps(rbac: AccessControlList): Promise<{
    filterProps: Array<FilterProps>;
    createProps: Array<CreateProps>;
    tableProps: TableProps;
    operators: Array<OperatorItems>;
  }> {
    // ACTIONS
    const availableActions = this.allActions(rbac);

    // PROPS
    const filterProps = await this.filterProps();
    const tableProps = await this.tableProps(availableActions);
    const createProps = [];

    return { operators: operatorsList, filterProps, createProps, tableProps };
  }

  async filterProps(): Promise<ModifiedFilterProps[]> {
    const filterProps: Array<ModifiedFilterProps> = [
      { id: 2, title: 'عنوان', key: 'title', type: 'string', operators: [] },
    ];

    return filterProps;
  }

  async tableProps(availableActions: Array<AvailableAction>): Promise<ModifiedTableProps> {
    const tableProps: ModifiedTableProps = {
      model: 'ticket',
      modelTitle: 'تیکت',
      columns: [
        { id: 1, title: 'شناسه', key: 'id', cellType: 'number' },
        { id: 2, title: 'موضوع', key: 'title', cellType: 'string' },
        { id: 5, title: 'پیام', key: 'message', cellType: 'string' },
        { id: 10, title: 'وضعیت', key: 'status', cellType: 'enum', enumList: TicketStatusList },

        /* ---------------------------------- date ---------------------------------- */
        { id: 100, title: 'تاریخ ایجاد', key: 'created_at', cellType: 'date' },
        { id: 110, title: 'تاریخ به روزرسانی', key: 'updated_at', cellType: 'date' },
      ],
      availableActions,
    };

    return tableProps;
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
  async replyTicket(ticketId: number, dto: ReplyTicketDto): Promise<void> {
    const ticket = await this.db.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (ticket === null) throw new NotFoundException('NOT_FOUND');

    // Save reply
    await this.db.ticketReplies.create({
      data: {
        ticket: { connect: { id: ticketId } },
        message: dto.message,
        by_admin: true,
      },
    });

    // Change ticket status to REPLIED
    await this.db.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        status: TicketCommonStatuses.REPLIED,
      },
    });
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

  allActions(rbac: AccessControlList): Array<AvailableAction> {
    const allActions: Array<AvailableAction> = ['create', 'show', 'edit', 'delete'];
    const availableActions: Array<AvailableAction> = [];
    for (const act of allActions) {
      // if (act == 'create' && rbac.c) availableActions.push('create');
      if (act == 'show' && rbac.r) availableActions.push('show');
      // if (act == 'edit' && rbac.u) availableActions.push('edit');
      if (act == 'delete' && rbac.d) availableActions.push('delete');
    }

    return availableActions;
  }
}
