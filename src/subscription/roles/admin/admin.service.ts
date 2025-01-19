import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, Subscription, Prisma, Advisor, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubscriptionAdminDto } from './dto/create.dto';
import {
  CreateProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { type PaginatedResult, paginate } from 'src/common/helpers/paginator';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/subscription/common/helpers/model-props-builder.helper';
import { SubscriptionStatus } from 'src/subscription/common/subscription-status.type';
import moment from 'moment-jalaali';

@Injectable()
export class SubscriptionAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateSubscriptionAdminDto): Promise<Subscription> {
    const newSubscription = await this.db.subscription.create({ data: dto });
    return newSubscription;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all Subscription
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.SubscriptionWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<Subscription>> {
    const list = await paginate()<
      Subscription & { advisor: Advisor & { user: User } },
      Prisma.SubscriptionFindManyArgs
    >(
      this.db.subscription,
      {
        where: { ...filters, status: SubscriptionStatus.SUCCESS },
        select: {
          id: true,
          is_special_advisor: true,
          is_promote: true,
          duration: true,
          created_at: true,
          title: true,
          price: true,
          advisor: { select: { user: { select: { mobile_number: true } } } },
        },
      },
      { page, perPage },
    );

    list.data = list.data.map((e) => ({
      ...e,
      mobile_number: e.advisor?.user?.mobile_number,
      expired_at: moment(e.created_at).add(e.duration, 'days'),
    }));

    return list;
  }

  /**
   * find one subscription
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.subscription.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    const showProps = showPropsBuilder(item);
    const actions = showActionBuilder(item);

    return { showProps, actions };
  }

  /**
   * find by id
   * @param id
   * @returns
   */
  async findById(id: number): Promise<Subscription> {
    const item = await this.db.subscription.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
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
