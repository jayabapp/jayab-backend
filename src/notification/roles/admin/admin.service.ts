import { Injectable } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from 'src/common/interfaces/role.enum';
import { SocketService } from 'src/socket/socket.service';
import { FindAllNotificationAdminDto } from './dto/find-all.dto';

@Injectable()
export class NotificationAdminService {
  constructor(
    private readonly db: PrismaService,
    private readonly socketService: SocketService,
  ) {}

  /**
   * Find all notification
   *
   * @param customerId
   * @param dto
   * @returns
   */
  async findAll(adminId: number, dto: FindAllNotificationAdminDto): Promise<Notification[]> {
    const result = await this.db.notification.findMany({
      where: { admin_id: adminId, role: UserRole.ADMIN, seen_at: null },
      orderBy: { created_at: 'desc' },
    });

    return result;
  }

  /**
   * Get notification badge
   *
   * @param {number} adminId
   * @returns
   */
  async findBadgeCount(adminId: number): Promise<number> {
    const count = await this.db.notification.count({
      where: { admin_id: adminId, role: UserRole.ADMIN, seen_at: null },
    });

    return count;
  }

  /**
   * update seen at for admin
   * @param adminId
   * @param notifId
   * @returns
   */
  async updateSeenAt(adminId: number, notifId: number): Promise<void> {
    await this.db.notification.update({
      where: { id: notifId, admin_id: adminId, role: UserRole.ADMIN },
      data: { seen_at: new Date() },
    });

    return;
  }

  /**
   * seen all
   * @param adminId
   * @returns
   */
  async updateSeenAll(adminId: number): Promise<void> {
    await this.db.notification.updateMany({
      where: { admin_id: adminId, role: UserRole.ADMIN, seen_at: null },
      data: { seen_at: new Date() },
    });

    return;
  }
}
