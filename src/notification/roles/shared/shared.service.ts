import { Injectable } from '@nestjs/common';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { Notification, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from 'src/common/interfaces/role.enum';
import { FindAllNotificationSharedDto } from './dto/find-all.dto';
import { FirebaseService } from 'src/firebase/firebase.service';
import { NotificationMessagePayload } from 'firebase-admin/lib/messaging/messaging-api';
import { SocketService } from 'src/socket/socket.service';
import { SocketEvents } from 'src/socket/common/socket-event.enum';
import { NotificationTypes } from 'src/firebase/constants/notif-types';
import { RequestType, UserType } from 'src/common/interfaces/user.interface';
import { FirebaseTopicType } from 'src/firebase/constants/topic-types';
import createTopicKey from 'src/firebase/common/topic-generator.helper';

type NotificationUser = { id: number; role: UserRole };

@Injectable()
export class NotificationSharedService {
  constructor(
    private readonly db: PrismaService,
    private readonly fcmService: FirebaseService,
    private readonly socketService: SocketService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * Find all notification
   *
   * @param customerId
   * @param dto
   * @returns
   */
  async findAll(
    user: UserType,
    dto: FindAllNotificationSharedDto,
    userRole?: UserRole,
  ): Promise<CursorPaginatedResult<Notification>> {
    const query = this.makeBaseQuery(user, userRole);

    const result = await cursorPaginate()<Notification, Prisma.NotificationFindManyArgs>(
      this.db.notification,
      {
        where: query,
        select: { id: true, title: true, body: true, is_sent_by_admin: true, created_at: true },
      },
      { cursor: dto.cursor },
    );

    await this.db.user.update({ where: { id: user.id }, data: { notification_read_at: new Date() } });

    return result;
  }

  /**
   * Get notification badge
   *
   * @param {number} customerId
   * @param {Date} notificationReadAtDate
   * @returns
   */
  async findBadgeCount(user: UserType, notificationReadAtDate: Date, userRole?: UserRole): Promise<number> {
    const query = this.makeBaseQuery(user, userRole);

    const count = await this.db.notification.count({
      where: { ...query, created_at: { gt: notificationReadAtDate } },
    });

    return count;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   *
   * @param data
   */
  async createNotification({
    user,
    mustSendNotif, // زمانی که فقط نیاز است لیست نوتیف کاربر آپدیت شود و نوتیفی ارسال نشود
    notification,
    notificationType,
    notificationableId, // ای دی ایتمی که براش نوتیف فرستادیم
    additionalEventData,
  }: {
    user: NotificationUser;
    mustSendNotif: boolean;
    notification: { title: string; body?: string };
    notificationType: NotificationTypes;
    notificationableId: string;
    additionalEventData?: object;
  }): Promise<void> {
    const eventData = {
      event_id: notificationableId,
      event_type: notificationType,
      ...(additionalEventData || {}),
    };

    /* ---------------------------------- SEND ---------------------------------- */
    if (user?.role === UserRole.ADMIN) {
      let q: Prisma.AdminWhereInput = {
        is_active: true,
        role: {
          notification_permissions: { permissions: { contains: `-${notificationType}` } },
        },
      };
      if (user.id) q = { ...q, id: user.id };
      const admins = await this.db.admin.findMany({ where: q });

      let ids = [];
      for (const admin of admins) {
        ids.push(admin.id);
        await this.create({ id: admin.id, role: UserRole.ADMIN }, notification, eventData);
      }
      this.socketService.emit(
        ids,
        {
          name: SocketEvents.NEW_NOTIFICATION,
          eventData,
          type: 'info',
          title: notification.title,
          body: notification.body,
        },
        UserRole.ADMIN,
      );
      console.log(`notif sent to ADMIN ID: ${ids?.join('-')}`);
    } else {
      this.socketService.emit(
        [user.id],
        {
          name: SocketEvents.NEW_NOTIFICATION,
          eventData,
          type: 'info',
          title: notification.title,
          body: notification.body,
        },
        UserRole.USER,
      );
      await this.create({ id: user.id, role: UserRole.USER }, notification, eventData);

      await this.fcmService.sendNotificationToTopic(createTopicKey(user.id, UserRole.USER), {
        notification: { title: notification.title, body: notification.body },
      });
      console.log(`notif sent to USER ID: ${user.id}`);
    }
  }

  /**
   *
   * @param userId
   * @param title
   * @param body
   * @param userRole
   */
  async create(
    user: NotificationUser,
    notification: NotificationMessagePayload,
    data: object,
  ): Promise<void> {
    let createData: Prisma.NotificationUncheckedCreateInput = {
      title: notification.title,
      body: notification.body,
      data,
    };

    if (user.role === UserRole.USER) {
      createData = { ...createData, user_id: user.id, role: UserRole.USER };
    } else if (user.role === UserRole.ADMIN) {
      createData = { ...createData, admin_id: user.id, role: UserRole.ADMIN };
    }

    // console.log({ createData });

    await this.db.notification.create({ data: createData });
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPER                                   */
  /* -------------------------------------------------------------------------- */
  makeBaseQuery(user: UserType, userRole?: UserRole): any {
    let query: Prisma.NotificationWhereInput = {
      OR: [
        { user_id: user.id, role: UserRole.USER },
        { topic: FirebaseTopicType.USER },
        { topic: FirebaseTopicType.TEST },
      ],
      created_at: { gte: user.created_at },
    };

    if (user?.advisor_id) query.OR.push({ topic: FirebaseTopicType.ADVISOR });
    if (user?.owner_id) query.OR.push({ topic: FirebaseTopicType.OWNER });

    return query;
  }
}

/*
async createNotification(data: {
    user: NotificationUser;
    notifType: NotificationTypes;
    mustSendNotif: boolean; // زمانی که فقط نیاز است لیست نوتیف کاربر آپدیت شود و نوتیفی ارسال نشود
    extraData?: any; // مثل اطلاعات اضافی کاربر
    extraText?: string; // مثل وضعیت سفارش
  }): Promise<void> {
    let notificationData: any = {};
    const fcmData = data.extraData;

    switch (data.notifType) {
      case NotificationTypes.NEW_DEPOSIT:
        notificationData = NotificationMessages.NEW_DEPOSIT(data?.extraData?.full_name);

        break;

      default:
        break;
    }

    if (data.mustSendNotif) {
      if (data.user.fcm_token)
        await this.fcmService.sendNotification([data.user.fcm_token], {
          notification: notificationData,
          data: { type: data.notifType, ...fcmData },
        });
      else if (data.user.topic)
        await this.fcmService.sendNotificationToTopic(data.user.topic, {
          notification: notificationData,
          data: { type: data.notifType, ...fcmData },
        });
      else if (data.user?.role === UserRole.ADMIN) {
        const admins = await this.db.admin.findMany({
          where: {
            role: {
              notification_permissions: { permissions: { contains: `-${NotificationTypes.NEW_DEPOSIT}` } },
            },
          },
        });
        let fcmTokens = [];
        for (const admin of admins) {
          if (admin.fcm_token) fcmTokens.push(admin.fcm_token);
        }
        console.log({ fcmTokens });

        await this.fcmService.sendNotification(fcmTokens, {
          notification: notificationData,
          data: { type: data.notifType, ...fcmData },
        });
      }
      console.log(
        `${data.notifType} notif sent to ${data.user?.role.toLocaleLowerCase()} ID: ${data.user.id}`,
      );
    }

    await this.create(data.user, notificationData, fcmData);
  }


*/
