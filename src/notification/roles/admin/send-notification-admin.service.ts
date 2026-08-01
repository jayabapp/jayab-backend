import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, Notification, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProps, OperatorItems, TableProps } from 'src/common/interfaces/model-props.interface';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  tablePropsBuilder,
} from 'src/notification/common/helpers/model-props-builder.helper';
import { operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { NotificationType } from 'src/notification/common/notification-type.type';
import { CreateNotificationAdminDto } from './dto/create.dto';
import { FirebaseService } from 'src/firebase/firebase.service';
import { isEmpty, isNaN } from 'lodash';
import { UserRole } from 'src/common/interfaces/role.enum';
import { FindAllNotificationAdminDto } from './dto/find-all.dto';
import { paginate, PaginatedResult } from 'src/common/helpers/paginator';

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
    /*  */
    // mobileNumbers.map((e) => {
    //   if (e.length != 11 || isNaN(+e)) throw new BadRequestException(`شماره ${e} اشتباه وارد شده است`);
    // });

    /* -------------------------------------------------------------------------- */
    // check mobiles and create notifications data
    const mobileNumbers = dto.mobile_numbers.split(',');
    const users = await this.db.user.findMany({ where: { mobile_number: { in: mobileNumbers } } });
    if (users.length != mobileNumbers.length) throw new BadRequestException('NOTIFICATION1');

    let fcmTokens: string[] = [];
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

    /* -------------------------------------------------------------------------- */
    // send notifications
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

  /* -------------------------------------------------------------------------- */
  /*                                   HELPER                                   */
  /* -------------------------------------------------------------------------- */
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
    // ACTIONS
    const availableActions = allActionsBuilder(rbac);

    // PROPS
    const filterProps = filterPropsBuilder();
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder(type);

    return { operators: operatorsList, filterProps, createProps, tableProps };
  }
}
