import { BadRequestException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { Prisma, Ticket, User } from '@prisma/client';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { TicketCommonStatuses } from '../../common/ticket-status.constant';

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

    const tickets = await this.db.ticket.findMany({
      where: { user_id: user?.id, replies: undefined },
    });

    if (tickets.length === 10) throw new BadRequestException('TICKET1');

    const result = await this.db.ticket.create({
      data: { ...dto, user_id: user?.id, status: TicketCommonStatuses.WAITING },
    });
    return { user, ticket: result };
  }

  /**
   * Find all
   * @param userId
   * @returns
   */
  async findAll(userId: number, page: number): Promise<PaginatedResult<Ticket>> {
    const tickets = await paginate()<Ticket, Prisma.TicketFindManyArgs>(
      this.db.ticket,
      {
        where: { user_id: userId },
        select: { id: true, title: true, message: true, status: true, created_at: true },
        orderBy: { id: 'desc' },
      },
      { page: page },
    );

    return tickets;
  }

  /**
   * Find One
   * @param userId
   * @param ticketId
   * @returns
   */
  async findOne(userId: number, ticketId: number): Promise<Partial<Ticket>> {
    const ticket = await this.db.ticket.findUnique({
      where: {
        id: ticketId,
      },
      select: {
        id: true,
        user_id: true,
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

    if (ticket === null || ticket.user_id != userId) throw new NotFoundException('NOT_FOUND');

    return ticket;
  }

  /**
   * reply ticket by customer
   * @param customerId
   * @param ticketId
   * @param dto
   */
  async replyTicket(userId: number, ticketId: number, dto: ReplyTicketDto): Promise<void> {
    const ticket = await this.db.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (ticket === null || ticket.user_id != userId) throw new NotFoundException('NOT_FOUND');

    // Check ticket status that be in REPLIED status
    if (ticket.status != TicketCommonStatuses.REPLIED)
      throw new NotAcceptableException(
        'تنها در صورتی که تیکت در وضعیت پاسخ داده شده باشد امکان ثبت پاسخ جدید وجود دارد',
      );

    // Save reply
    await this.db.ticketReplies.create({
      data: {
        ticket: { connect: { id: ticketId } },
        message: dto.message,
      },
    });

    // Change ticket status to WAITING
    await this.db.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        status: TicketCommonStatuses.WAITING,
      },
    });
  }
}
