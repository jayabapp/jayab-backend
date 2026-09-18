import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, Notification, Prisma } from '@prisma/client';
import { CreateProps, OperatorItems, TableProps } from 'src/common/interfaces/model-props.interface';
import { CreateNotificationAdminDto } from './dto/create.dto';
import { paginate, PaginatedResult } from 'src/common/helpers/paginator';
import { createPropsBuilder } from 'src/notification/common/helpers/model-props-builder.helper';
import { filterPropsBuilder } from 'src/notification/common/helpers/model-props-builder.helper';
import { tablePropsBuilder } from 'src/notification/common/helpers/model-props-builder.helper';
import { allActionsBuilder } from 'src/notification/common/helpers/model-props-builder.helper';
import { NotificationType } from 'src/notification/common/notification-type.type';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { UserRole } from 'src/common/interfaces/role.enum';
import { isEmpty } from 'lodash';

@Injectable()
export class SendNotificationAdminService {
  constructor(
    private readonly db: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async sendToGroup(dto: CreateNotificationAdminDto): Promise<void> {
    /*  */
    await this.db.notification.create({
      data: { is_sent_by_admin: true, title: dto.title, body: dto.body, topic: dto.topic },
    });

    /*  */
    await this.firebaseService.sendNotificationToTopic(dto.topic, {
      notification: { title: dto.title, body: dto.body },
      data: {},
    });
  }

  async sendToMobiles(dto: CreateNotificationAdminDto): Promise<void> {
    const mobileNumbers = dto.mobile_numbers.split(',');
    const users = await this.db.user.findMany({ where: { mobile_number: { in: mobileNumbers } } });
    if (users.length != mobileNumbers.length) throw new BadRequestException('NOTIFICATION1');
    const fcmTokens: string[] = [];
    const notificationData: Prisma.NotificationCreateManyInput[] = [];
    users.map((e) => {
      if (e?.fcm_token) fcmTokens.push(e?.fcm_token);
      notificationData.push({
        is_sent_by_admin: true,
        title: dto.title,
        body: dto.body,
        user_id: e.id,
        role: UserRole.USER,
        data: { mobile_number: e.mobile_number },
      });
    });

    await this.db.notification.createMany({ data: notificationData });

    if (!isEmpty(fcmTokens))
      await this.firebaseService.sendNotification(fcmTokens, {
        notification: { title: dto.title, body: dto.body },
        data: {},
      });
  }

  async findAllSent(
    filters: Prisma.NotificationWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<any>> {
    const list = await paginate()<Notification, Prisma.NotificationFindManyArgs>(
      this.db.notification,
      { where: filters },
      { page, perPage },
    );

    return list;
  }

  async findById(id: number): Promise<Notification> {
    const item = await this.db.notification.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');
    return item;
  }

  async delete(id: number): Promise<void> {
    await this.db.notification.delete({ where: { id } });
  }

  /**
   * find model props
   * @param rbac
   * @returns
   */
  async findModelProps(
    rbac: AccessControlList,
    type: NotificationType,
  ): Promise<{
    filterProps: Array<CreateProps>;
    createProps: Array<CreateProps>;
    tableProps: TableProps;
    operators: Array<OperatorItems>;
  }> {
    const availableActions = allActionsBuilder(rbac);
    const filterProps = filterPropsBuilder();
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder(type);
    return { operators: operatorsList, filterProps, createProps, tableProps };
  }
}
