import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionPlan, Prisma, Property } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllSubscriptionPlanUserDto } from './dto/find-all.dto';
import moment from 'moment-jalaali';
import {
  CannotBuySubscriptionStatuses,
  PropertyStatuses,
} from 'src/property/common/types/property-status.type';

@Injectable()
export class SubscriptionPlanUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all SubscriptionPlan
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllSubscriptionPlanUserDto): Promise<Partial<SubscriptionPlan>[]> {
    const list = this.db.subscriptionPlan.findMany({
      where: { group: dto.type, is_active: true },
      select: {
        id: true,
        title: true,
        price: true,
        price_with_discount: true,
        is_promote: true,
        description: true,
      },
    });

    return list;
  }

  /**
   * find one subscriptionPlan
   * @param subscriptionPlanId
   * @returns
   */
  async findOne(subscriptionPlanId: number, isPromote = false): Promise<SubscriptionPlan> {
    const item = await this.db.subscriptionPlan.findFirst({
      where: { id: subscriptionPlanId },
    });

    if (!item) throw new NotFoundException('SUBSCRIPTION_PLAN_NOT_FOUND');
    if (isPromote && !item.is_promote) throw new BadRequestException('SUBSCRIPTION_PLAN_NOT_FOUND2');

    return item;
  }

  /**
   *
   * @param subscriptionPlanId
   * @param propertySortOrder
   */
  async checkCanBuyPromote(subscriptionPlanId: number, property: Property): Promise<SubscriptionPlan> {
    if (CannotBuySubscriptionStatuses.includes(property.status))
      throw new BadRequestException('PROPERTY_SUB1');

    //
    const timestamp = Number(property.sort_order);
    const twoDaysAgo = moment().subtract(2, 'days');
    if (moment(timestamp).isBefore(twoDaysAgo)) throw new BadRequestException('PROPERTY_SUB2');

    //
    const promote = await this.findOne(subscriptionPlanId, true);
    return promote;
  }
}
