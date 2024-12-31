import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionPlan, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubscriptionPlanUserDto } from './dto/create.dto';
import { UpdateSubscriptionPlanUserDto } from './dto/update.dto';
import { FindAllSubscriptionPlanUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';

@Injectable()
export class SubscriptionPlanUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateSubscriptionPlanUserDto): Promise<SubscriptionPlan> {
    const newSubscriptionPlan = await this.db.subscriptionPlan.create({ data: dto });
    return newSubscriptionPlan;
  }

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
  async findOne(subscriptionPlanId: number): Promise<SubscriptionPlan> {
    const item = await this.db.subscriptionPlan.findFirst({
      where: { id: subscriptionPlanId },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /**
   * update
   * @param subscriptionPlanId
   * @param dto
   * @returns
   */
  async update(subscriptionPlanId: number, dto: UpdateSubscriptionPlanUserDto): Promise<SubscriptionPlan> {
    const item = await this.db.subscriptionPlan.update({
      where: { id: subscriptionPlanId },
      data: dto,
    });

    return item;
  }

  // /**
  //  * remove
  //  * @param subscriptionPlanId
  //  */
  // async remove(subscriptionPlanId: number): Promise<void> {
  //   await this.db.subscriptionPlan.delete({ where: { id: subscriptionPlanId } });
  // }
}
