import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AccessControlList,
  Subscription,
  Prisma,
  Advisor,
  User,
  Property,
  Owner,
  SubscriptionPlan,
} from '@prisma/client';
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
import { SubscriptionPlanAdminService } from 'src/subscription-plan/roles/admin/admin.service';
import { SubscriptionPlanGroup } from 'src/subscription-plan/common/subscription-plan-group.type';
import { endOfDate } from 'src/common/helpers/date.helper';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';

@Injectable()
export class SubscriptionAdminService {
  constructor(
    private readonly db: PrismaService,
    private readonly subscriptionPlanAdminService: SubscriptionPlanAdminService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  async createSubForAdvisor(dto: CreateSubscriptionAdminDto): Promise<void> {
    /*  */
    const subPlan = await this.subscriptionPlanAdminService.findOneByGroup(
      dto.subscription_plan_id,
      SubscriptionPlanGroup.ADVISOR,
    );

    /*  */
    const advisor = await this.db.advisor.findUnique({ where: { id: dto.advisor_id } });
    const lastSubExpiredAt = advisor?.subscription_expired_at || undefined;

    const now = moment();
    let newExpDate = null;
    let description = '';

    if (now.isAfter(lastSubExpiredAt) || advisor.is_special !== subPlan.is_special) {
      description = 'حذف اشتراک قبلی به علت تغییر پلن و خرید پلن جدید توسط ادمین';
      newExpDate = endOfDate(now.add(subPlan.duration, 'days').toDate());
    } else {
      description = lastSubExpiredAt ? 'تمدید اشتراک قبلی توسط ادمین' : 'خرید توسط ادمین';
      newExpDate = endOfDate(moment(lastSubExpiredAt).add(subPlan.duration, 'days').toDate());
    }

    /*  */
    await this.db.$transaction(async (tx) => {
      await tx.subscription.create({
        data: {
          advisor_id: dto.advisor_id,
          is_special_advisor: subPlan.is_special,
          status: SubscriptionStatus.SUCCESS,
          title: subPlan.title,
          duration: subPlan.duration,
          price: subPlan.price,
          description,
        },
      });

      await tx.advisor.update({
        where: { id: advisor.id },
        data: { subscription_expired_at: newExpDate, is_special: subPlan.is_special },
      });
    });
  }

  async createSubForProperty(dto: CreateSubscriptionAdminDto): Promise<void> {
    /*  */
    const subPlan = await this.subscriptionPlanAdminService.findOneByGroup(
      dto.subscription_plan_id,
      SubscriptionPlanGroup.PROPERTY,
    );

    /*  */
    const property = await this.db.property.findUnique({ where: { id: dto.property_id } });
    const lastSubExpiredAt = property?.subscription_expired_at || undefined;

    /*  */
    let description = '';

    let propertyUpdateData: Prisma.PropertyUpdateInput = {};
    if (subPlan.is_promote) {
      description = 'تمدید انقضای نردبان توسط ادمین';
      propertyUpdateData = { sort_order: Date.now() };
    } else {
      const now = moment();
      let newExpDate = null;

      if (now.isAfter(lastSubExpiredAt)) {
        description = 'حذف اشتراک قبلی به علت تغییر پلن و خرید پلن جدید توسط ادمین';
        newExpDate = endOfDate(now.add(subPlan.duration, 'days').toDate());
      } else {
        description = lastSubExpiredAt ? 'تمدید اشتراک قبلی توسط ادمین' : 'خرید توسط ادمین';
        newExpDate = endOfDate(moment(lastSubExpiredAt).add(subPlan.duration, 'days').toDate());
      }

      propertyUpdateData = { subscription_expired_at: newExpDate };
    }

    /*  */
    await this.db.$transaction(async (tx) => {
      await tx.subscription.create({
        data: {
          property_id: property.id,
          is_promote: subPlan.is_promote,
          title: subPlan.title,
          duration: subPlan.duration,
          price: subPlan.price,
          status: SubscriptionStatus.SUCCESS,
          description,
        },
      });

      await tx.property.update({ where: { id: property.id }, data: propertyUpdateData });
    });
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
      Subscription & { advisor: Advisor & { user: User } } & {
        property: Property & { owner: Owner & { user: User } };
      },
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
          description: true,
          advisor: { select: { subscription_expired_at: true, user: { select: { mobile_number: true } } } },
          property: { select: { owner: { select: { user: { select: { mobile_number: true } } } } } },
        },
      },
      { page, perPage },
    );

    list.data = list.data.map((e) => {
      const advisor = e?.advisor;
      const property = e?.property;
      const mobileNumber = advisor?.user.mobile_number || property?.owner.user.mobile_number;
      const type = advisor ? 'مشاور' : 'ملک';

      return { ...e, mobile_number: mobileNumber, type };
    });

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
