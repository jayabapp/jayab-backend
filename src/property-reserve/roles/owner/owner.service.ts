import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyReserve, Prisma, Property, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllPropertyReserveOwnerDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import moment from 'moment-jalaali';
import { RESERVE_TTL_MINUTES } from 'src/property-reserve/common/constants/reserve.constant';
import { startOfToday } from 'src/common/helpers/date.helper';
import { maskedUserMobile } from 'src/common/helpers/masked-user-mobile.helper';
import { PropertyReserveStatusList } from 'src/property-reserve/common/interfaces/property-reserve-status.type';

@Injectable()
export class PropertyReserveOwnerService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all PropertyReserve
   * درخواست های سی روز گذشته مالک
   * @param dto
   * @returns
   */
  async findAll(
    dto: FindAllPropertyReserveOwnerDto,
    ownerId: number,
  ): Promise<CursorPaginatedResult<PropertyReserve>> {
    const list = await cursorPaginate()<
      PropertyReserve & { property: Partial<Property>; user: Partial<User> },
      Prisma.PropertyReserveFindManyArgs
    >(
      this.db.propertyReserve,
      {
        where: {
          property: { owner_id: ownerId },
          expired_at: null,
          created_at: { gt: moment().subtract(30, 'day').toDate() },
        },
        include: {
          property: {
            select: {
              title: true,
              slug: true,
              code: true,
              feature_image: true,
              subscription_expired_at: true,
            },
          },
          user: { select: { mobile_number: true, full_name: true } },
        },
      },
      { cursor: dto.cursor },
    );

    const formatted = [];
    for (const item of list.data) {
      const ttl = moment(item.created_at).add(RESERVE_TTL_MINUTES, 'minutes').diff(moment(), 's');
      const isPropertyExpired = item.property.subscription_expired_at < startOfToday();
      let guestMobile = item.user.mobile_number;
      if (isPropertyExpired) guestMobile = maskedUserMobile(guestMobile);

      formatted.push({
        ...item,
        ttl_seconds: ttl > 0 ? ttl : 0,
        guest_mobile: guestMobile,
        status: PropertyReserveStatusList.find((e) => e.id === item.status),
      });
    }
    return { data: formatted };
  }

  /**
   * find one propertyReserve
   * @param propertyReserveId
   * @returns
   */
  async findOne(propertyReserveId: number): Promise<PropertyReserve> {
    const item = await this.db.propertyReserve.findFirst({
      where: { id: propertyReserveId },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }
}
