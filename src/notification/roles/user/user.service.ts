import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllNotificationUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { UserRole } from 'src/common/interfaces/role.enum';

@Injectable()
export class NotificationUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all Notification
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllNotificationUserDto): Promise<CursorPaginatedResult<Notification>> {
    const list = await cursorPaginate()<Notification, Prisma.NotificationFindManyArgs>(
      this.db.notification,
      { where: {} },
      { cursor: dto.cursor },
    );

    return list;
  }

  /**
   * find one notification
   * @param notificationId
   * @returns
   */
  async findOne(userId: number, userRole: UserRole, notificationId: number): Promise<Partial<Notification>> {
    const item = await this.db.notification.findFirst({
      where: { id: notificationId, user_id: userId, role: userRole },
      select: { title: true, body: true, data: true },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }
}
