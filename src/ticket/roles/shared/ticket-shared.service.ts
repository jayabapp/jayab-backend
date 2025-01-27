import { BadRequestException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { Prisma, Ticket, User } from '@prisma/client';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { type PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { TicketCommonStatuses, TicketStatusList } from '../../common/ticket-status.constant';
import { UserRole } from 'src/common/interfaces/role.enum';

@Injectable()
export class TicketSharedService {
  constructor(
    private readonly db: PrismaService,
    private readonly fcmService: FirebaseService,
  ) {}

  /**
   * Add ticket
   *
   * @param dto
   * @param userId
   * @returns
   */
  async create(userId: number, dto: CreateTicketDto): Promise<{ ticket: Ticket; user: User }> {
    const user = await this.db.user.findUnique({ where: { id: userId } });

    const waitingTickets = await this.db.ticket.findMany({
      where: { user_id: userId, replies: undefined, status: TicketCommonStatuses.WAITING },
    });

    if (waitingTickets.length >= 5) throw new BadRequestException('TICKET1');

    const result = await this.db.ticket.create({
      data: {
        ...dto,
        user_id: userId,
        status: TicketCommonStatuses.WAITING,
      },
    });

    return { user, ticket: result };
  }

  /**
   * Find all
   * @param userId
   * @returns
   */
  async findAll(user: any, page: number): Promise<PaginatedResult<Ticket>> {
    const tickets = await paginate()<Ticket, Prisma.TicketFindManyArgs>(
      this.db.ticket,
      {
        where: { user_id: user.id },
        select: {
          id: true,
          title: true,
          message: true,
          status: true,
          created_at: true,
        },
        orderBy: { id: 'desc' },
      },
      { page: page },
    );

    // @ts-ignore
    tickets.data = tickets.data.map((ticket) => ({
      ...ticket,
      status: TicketStatusList.find((e) => e.id === ticket.status),
    }));

    return tickets;
  }

  /**
   * Find One
   * @param userId
   * @param ticketId
   * @returns
   */
  async findOne(user: any, ticketId: number): Promise<Partial<Ticket>> {
    const ticket = await this.db.ticket.findUnique({
      where: {
        id: ticketId,
        user_id: user.id,
      },
      select: {
        user_id: true,
        id: true,
        title: true,
        message: true,
        status: true,
        created_at: true,
        replies: {
          select: {
            id: true,
            message: true,
            by_admin: true,
            created_at: true,
          },
        },
      },
    });

    if (!ticket) throw new NotFoundException('NOT_FOUND');

    return ticket;
  }

  /**
   * reply ticket by customer
   * @param customerId
   * @param ticketId
   * @param dto
   */
  async replyTicket(user: any, ticketId: number, dto: ReplyTicketDto): Promise<Ticket> {
    const ticket = await this.db.ticket.findUnique({ where: { id: ticketId, user_id: user.id } });

    if (!ticket) throw new NotFoundException('NOT_FOUND');

    // Check ticket status that be open
    if (ticket.status === TicketCommonStatuses.CLOSED) throw new NotAcceptableException('TICKET2');

    // Save reply
    await this.db.ticketReplies.create({ data: { ticket_id: ticketId, message: dto.message } });

    // Change ticket status to WAITING
    const updatedTicket = await this.db.ticket.update({
      where: { id: ticket.id },
      data: { status: TicketCommonStatuses.WAITING },
    });
    return updatedTicket;
  }
}
