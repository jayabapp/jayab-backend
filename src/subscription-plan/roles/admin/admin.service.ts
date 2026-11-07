import { AccessControlList, SubscriptionPlan, Prisma } from '@prisma/client';
import { CreateProps, OperatorItems, ShowAction } from 'src/common/interfaces/model-props.interface';
import { UpdatePartialSubscriptionPlanAdminDto } from './dto/update-partial.dto';
import { CreateSubscriptionPlanAdminDto } from './dto/create.dto';
import { UpdateSubscriptionPlanAdminDto } from './dto/update.dto';
import { type PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ShowProps, TableProps } from 'src/common/interfaces/model-props.interface';
import { SubscriptionPlanGroup } from 'src/subscription-plan/common/subscription-plan-group.type';
import { PLAN_TEXT_FIELDS } from 'src/subscription-plan/common/subscription-plan-translations.constant';
import { PrismaService } from 'src/prisma/prisma.service';
import { cleanEditions } from 'src/property/common/helpers/property-translations.helper';
import { operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/subscription-plan/common/helpers/model-props-builder.helper';

const withPlanTranslations = <T extends { translations?: CreateSubscriptionPlanAdminDto['translations'] }>({
  translations,
  ...data
}: T) => ({
  ...data,
  ...(translations !== undefined
    ? { translations: cleanEditions(translations, PLAN_TEXT_FIELDS) ?? Prisma.DbNull }
    : {}),
});

@Injectable()
export class SubscriptionPlanAdminService {
  constructor(private readonly db: PrismaService) {}

  async create(dto: CreateSubscriptionPlanAdminDto): Promise<SubscriptionPlan> {
    const newSubscriptionPlan = await this.db.subscriptionPlan.create({ data: withPlanTranslations(dto) });
    return newSubscriptionPlan;
  }

  async findOneByGroup(id: number, group: SubscriptionPlanGroup): Promise<SubscriptionPlan> {
    const plan = await this.db.subscriptionPlan.findUnique({ where: { id, group, is_active: true } });
    if (!plan) throw new NotFoundException('NOT_FOUND');
    return plan;
  }

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

  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.subscriptionPlan.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('SUBSCRIPTION_PLAN_NOT_FOUND');
    const showProps = showPropsBuilder(item);
    const actions = showActionBuilder(item);
    return { showProps, actions };
  }

  async findById(id: number): Promise<SubscriptionPlan> {
    const item = await this.db.subscriptionPlan.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');
    return item;
  }

  async update(id: number, dto: UpdateSubscriptionPlanAdminDto): Promise<SubscriptionPlan> {
    const item = await this.db.subscriptionPlan.update({
      where: { id },
      data: withPlanTranslations(dto),
    });
    return item;
  }

  async updatePartial(id: number, dto: UpdatePartialSubscriptionPlanAdminDto): Promise<SubscriptionPlan> {
    const item = await this.db.subscriptionPlan.update({
      where: { id },
      data: dto,
    });
    return item;
  }

  async remove(id: number): Promise<void> {
    await this.db.subscriptionPlan.delete({ where: { id } });
  }

  async findModelProps(rbac: AccessControlList): Promise<{
    filterProps: Array<CreateProps>;
    createProps: Array<CreateProps>;
    tableProps: TableProps;
    operators: Array<OperatorItems>;
  }> {
    const availableActions = allActionsBuilder(rbac);
    const filterProps = filterPropsBuilder();
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder();
    return { operators: operatorsList, filterProps, createProps, tableProps };
  }
}
