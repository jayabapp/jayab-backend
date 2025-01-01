import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, SubscriptionPlan, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubscriptionPlanAdminDto } from './dto/create.dto';
import { UpdateSubscriptionPlanAdminDto } from './dto/update.dto';
import {
  CreateProps,
  FilterProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operators, operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { type PaginatedResult, paginate } from 'src/common/helpers/paginator';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/subscription-plan/common/helpers/model-props-builder.helper';
import { UpdatePartialSubscriptionPlanAdminDto } from './dto/update-partial.dto';

@Injectable()
export class SubscriptionPlanAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateSubscriptionPlanAdminDto): Promise<SubscriptionPlan> {
    const newSubscriptionPlan = await this.db.subscriptionPlan.create({ data: dto });
    return newSubscriptionPlan;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all SubscriptionPlan
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.SubscriptionPlanWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<SubscriptionPlan>> {
    const list = await paginate()<SubscriptionPlan, Prisma.SubscriptionPlanFindManyArgs>(
      this.db.subscriptionPlan,
      { where: filters },
      { page, perPage },
    );

    return list;
  }

  /**
   * find one subscriptionPlan
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.subscriptionPlan.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('SUBSCRIPTION_PLAN_NOT_FOUND');

    const showProps = showPropsBuilder(item);
    const actions = showActionBuilder(item);

    return { showProps, actions };
  }

  /**
   * find by id
   * @param id
   * @returns
   */
  async findById(id: number): Promise<SubscriptionPlan> {
    const item = await this.db.subscriptionPlan.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * update
   * @param id
   * @param dto
   * @returns
   */
  async update(id: number, dto: UpdateSubscriptionPlanAdminDto): Promise<SubscriptionPlan> {
    const item = await this.db.subscriptionPlan.update({
      where: { id },
      data: dto,
    });

    return item;
  }

  /**
   * Update editable columns in admin panel table
   * @param id
   * @param dto
   * @returns
   */
  async updatePartial(id: number, dto: UpdatePartialSubscriptionPlanAdminDto): Promise<SubscriptionPlan> {
    const item = await this.db.subscriptionPlan.update({
      where: { id },
      data: dto,
    });

    return item;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * remove
   * @param id
   */
  async remove(id: number): Promise<void> {
    await this.db.subscriptionPlan.delete({ where: { id } });
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
