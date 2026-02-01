import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Property, SubscriptionPlan } from '@prisma/client';
import { PartialUser } from 'src/common/interfaces/user.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { SubscriptionPlanGroup } from 'src/subscription-plan/common/subscription-plan-group.type';
import { FindAllSubscriptionPlanUserDto } from './dto/find-all.dto';
import moment from 'moment-jalaali';

@Injectable()
export class SubscriptionPlanUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all SubscriptionPlan
   * @param dto
   * @returns
   */
  async findAll(
    user: PartialUser,
    dto: FindAllSubscriptionPlanUserDto,
  ): Promise<{ list: Partial<SubscriptionPlan>[]; can_promote: boolean }> {
    let canPromote = false;

    /* -------------------------------------------------------------------------- */
    if (dto.property_id) {
      const property = await this.db.property.findFirst({
        where: { id: dto.property_id, owner_id: user.owner_id },
      });

      if (!property) throw new NotFoundException('PROPERTY_NOT_FOUND');
      if (property.status === PropertyStatuses.PUBLISHED) canPromote = true;
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
      },
      orderBy: { sort: { sort: 'asc', nulls: 'last' } },
    });

    return { list, can_promote: canPromote };
  }

  /**
   * find one subscriptionPlan
   * @param subscriptionPlanId
   * @returns
   */
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

  /**
   *
   * @param subscriptionPlanId
   * @param propertySortOrder
   */
  async checkCanBuyPromote(
    promoteId: number,
    subscriptionId: number,
    property: Property,
  ): Promise<SubscriptionPlan | null> {
    if (property.status !== PropertyStatuses.PUBLISHED) return;

    //اگر منقضی بود باید همزمان اشتراک هم بخرد
    if (moment(property.subscription_expired_at).isBefore(moment()) && !subscriptionId)
      throw new BadRequestException('BUY_SUBSCRIPTION2');

    const promote = await this.findOne(promoteId, true);

    return promote;
  }
}
