import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FindAllSubscriptionPlanUserDto } from './dto/find-all.dto';
import { Property, SubscriptionPlan } from '@prisma/client';
import { SubscriptionPlanGroup } from 'src/subscription-plan/common/subscription-plan-group.type';
import { SettingAdminService } from 'src/setting/roles/admin/admin.service';
import { localizeTextFields } from 'src/common/helpers/title-translations.helper';
import { SubscriptionStatus } from 'src/subscription/common/subscription-status.type';
import { PLAN_TEXT_FIELDS } from 'src/subscription-plan/common/subscription-plan-translations.constant';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { startOfToday } from 'src/common/helpers/date.helper';
import { PartialUser } from 'src/common/interfaces/user.interface';

import moment from 'moment-jalaali';

@Injectable()
export class SubscriptionPlanUserService {
  constructor(
    private readonly db: PrismaService,
    private readonly setting: SettingAdminService,
  ) {}

  async findAll(
    user: PartialUser,
    dto: FindAllSubscriptionPlanUserDto,
  ): Promise<{ list: Partial<SubscriptionPlan>[]; can_promote: boolean }> {
    let canPromote = true;

    /* -------------------------------------------------------------------------- */
    if (dto.property_id) {
      const property = await this.db.property.findFirst({
        where: { id: dto.property_id, owner_id: user.owner_id },
      });

      if (!property) throw new NotFoundException('PROPERTY_NOT_FOUND');

      const subscriptionCounts = await this.db.subscription.count({
        where: { property_id: dto.property_id, status: SubscriptionStatus.SUCCESS },
      });

      if (subscriptionCounts === 0) canPromote = false;
    }

    /* -------------------------------------------------------------------------- */
    const list = await this.db.subscriptionPlan.findMany({
      where: { group: dto.type, is_active: true },
      select: {
        id: true,
        title: true,
        price: true,
        price_with_discount: true,
        is_promote: true,
        description: true,
        is_special: true,
        ribbon_bg_color: true,
        ribbon_title: true,
        ribbon_title_color: true,
        translations: true,
      },
      orderBy: { sort: { sort: 'asc', nulls: 'last' } },
    });
    return {
      list: list.map((plan) => localizeTextFields(plan, PLAN_TEXT_FIELDS, dto.locale)),
      can_promote: canPromote,
    };
  }

  async findOne(
    subscriptionPlanId: number,
    isPromote = false,
    isSpecialAdvisor = false,
  ): Promise<SubscriptionPlan> {
    const item = await this.db.subscriptionPlan.findFirst({ where: { id: subscriptionPlanId } });
    if (!item) throw new NotFoundException('SUBSCRIPTION_PLAN_NOT_FOUND');
    if (isPromote && !item.is_promote) throw new BadRequestException('SUBSCRIPTION_PLAN_NOT_FOUND2');
    if (isSpecialAdvisor && item.group !== SubscriptionPlanGroup.ADVISOR)
      throw new BadRequestException('SUBSCRIPTION_PLAN_NOT_FOUND2');
    return item;
  }

  async checkCanBuyPromote(
    promoteId: number,
    subscriptionId: number,
    property: Property,
  ): Promise<SubscriptionPlan | null> {
    if (property.status !== PropertyStatuses.PUBLISHED) return;
    if (moment(property.subscription_expired_at).isBefore(startOfToday()) && !subscriptionId)
      throw new BadRequestException('BUY_SUBSCRIPTION2');
    const promote = await this.findOne(promoteId, true);

    return promote;
  }
}
