import { BadRequestException, Injectable } from '@nestjs/common';
import { Subscription, Prisma, Payment } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllSubscriptionUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { PartialUser } from 'src/common/interfaces/user.interface';
import { SubscriptionStatus, SubscriptionStatusList } from 'src/subscription/common/subscription-status.type';
import { PaymentStatuses } from 'src/payment/common/payment-status.enum';
import { startOfDate } from 'src/common/helpers/date.helper';
import moment from 'moment-jalaali';

@Injectable()
export class SubscriptionUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all Subscription
   * @param user
   * @param dto
   * @returns
   */
  async findAll(
    user: PartialUser,
    dto: FindAllSubscriptionUserDto,
  ): Promise<CursorPaginatedResult<Subscription>> {
    /*  */

    let query: Prisma.SubscriptionWhereInput = { status: SubscriptionStatus.SUCCESS, OR: [] };
    if (user?.advisor_id) query.OR.push({ advisor_id: user?.advisor_id });
    if (user?.owner_id) query.OR.push({ property: { owner_id: user?.owner_id } });

    /**
     * check dates
     */
    const fromDate = dto.from ? startOfDate(dto.from) : null;
    const toDate = dto.to ? startOfDate(dto.to) : null;

    if (fromDate && toDate) {
      if (moment(fromDate).isAfter(moment(toDate))) throw new BadRequestException('PROFILE8');
      query = { ...query, created_at: { gte: fromDate, lte: toDate } };
    } else if (fromDate) {
      query = { ...query, created_at: { gte: fromDate } };
    } else if (toDate) {
      query = { ...query, created_at: { lte: toDate } };
    }

    /*  */
    const list = await cursorPaginate()<Subscription & { payment: Payment }, Prisma.SubscriptionFindManyArgs>(
      this.db.subscription,
      {
        where: query,
        select: {
          id: true,
          property_id: true,
          advisor_id: true,
          is_promote: true,
          is_special_advisor: true,
          title: true,
          status: true,
          description: true,
          price: true,
          duration: true,
          payment: { select: { ref_id: true } },
          created_at: true,
        },
      },
      { cursor: dto.cursor },
    );

    /**
     * serialized
     */
    // @ts-ignore
    list.data = list.data.map((e) => {
      let type = '';
      if (e?.advisor_id && e.is_special_advisor) type = 'خرید اشتراک مشاور (ویژه)';
      else if (e?.advisor_id) type = 'خرید اشتراک مشاور';
      else if (e?.property_id && e.is_promote) type = 'خرید نردبان آگهی';
      else if (e?.property_id) type = 'خرید اشتراک آگهی';

      const refId = e?.payment?.ref_id || null;
      const status = SubscriptionStatusList.find((s) => s.id == e.status);
      delete e.payment;
      delete e.advisor_id;
      delete e.property_id;

      return { ...e, type, ref_id: refId, status };
    });

    return list;
  }
}
