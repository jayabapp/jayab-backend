import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { PropertyJsonType, PropertySerializer } from 'src/property/serializer/property.serializer';
import { localizePlaces, PLACE_TITLE_SELECT } from 'src/city/common/helpers/city-locale.helper';
import { FindAllPropertyReserveOwnerDto } from './dto/find-all.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyReserve, Prisma, User } from '@prisma/client';
import { PropertyReserveStatusList } from 'src/property-reserve/common/interfaces/property-reserve-status.type';
import { PropertyReserveStatus } from 'src/property-reserve/common/interfaces/property-reserve-status.type';
import { SettingAdminService } from 'src/setting/roles/admin/admin.service';
import { RESERVE_TTL_MINUTES } from 'src/property-reserve/common/constants/reserve.constant';
import { maskedUserMobile } from 'src/common/helpers/masked-user-mobile.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { startOfToday } from 'src/common/helpers/date.helper';
import { SmsService } from 'src/sms/sms.service';
import { SettingKey } from 'src/setting/common/interfaces/settings.interface';
import { DayHelper } from 'src/common/helpers/day.helper';

import moment from 'moment-jalaali';

@Injectable()
export class PropertyReserveOwnerService {
  constructor(
    private readonly db: PrismaService,
    private readonly smsService: SmsService,
    private readonly setting: SettingAdminService,
    private readonly propertySerializer: PropertySerializer,
    private readonly dayHelper: DayHelper,
  ) {}

  async findAll(
    dto: FindAllPropertyReserveOwnerDto,
    ownerId: number,
  ): Promise<CursorPaginatedResult<PropertyReserve>> {
    const list = await cursorPaginate()<
      PropertyReserve & { property: PropertyJsonType; user: Partial<User> },
      Prisma.PropertyReserveFindManyArgs
    >(
      this.db.propertyReserve,
      {
        where: {
          property: { owner_id: ownerId },
          created_at: { gt: moment().subtract(6, 'jMonth').toDate() },
        },
        include: {
          property: {
            include: {
              feature_image: true,
              province: PLACE_TITLE_SELECT,
              city: PLACE_TITLE_SELECT,
              region: PLACE_TITLE_SELECT,
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
      const showCounter = item.status === PropertyReserveStatus.PENDING;
      const isPropertyExpired = item.property.subscription_expired_at < startOfToday();
      let guestMobile = item.user.mobile_number;
      if (isPropertyExpired) guestMobile = maskedUserMobile(guestMobile);

      formatted.push({
        ...item,
        ttl_seconds: ttl > 0 ? ttl : 0,
        show_counter: showCounter,
        guest_mobile: guestMobile,
        status: PropertyReserveStatusList.find((e) => e.id === item.status),
        is_subscription_expired: isPropertyExpired,
        property: localizePlaces(item.property, dto.locale),
      });
    }
    return { data: formatted };
  }

  async findOne(propertyReserveId: number): Promise<PropertyReserve> {
    const item = await this.db.propertyReserve.findFirst({
      where: { id: propertyReserveId },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');
    return item;
  }

  async countAllActive(ownerId: number): Promise<number> {
    return await this.db.propertyReserve.count({
      where: { property: { owner_id: ownerId }, expired_at: null, canceled_at: null },
    });
  }

  async markSeen(reserveId: number): Promise<void> {
    await this.db.propertyReserve.updateMany({
      where: { id: reserveId, owner_seen_at: null },
      data: { owner_seen_at: new Date() },
    });
  }

  async clickGuestMobile(reserveId: number): Promise<void> {
    const reserve = await this.db.propertyReserve.update({
      where: { id: reserveId },
      select: {
        id: true,
        status: true,
        owner_clicked_guest_mobile: true,
        property: { select: { code: true, subscription_expired_at: true } },
      },
      data: { owner_clicked_guest_mobile: { increment: 1 } },
    });
    if (!reserve) return;

    const isPropertyExpired = reserve.property.subscription_expired_at < startOfToday();

    if (reserve.owner_clicked_guest_mobile < 3 && isPropertyExpired) {
      const adminMobile = await this.setting.get(SettingKey.JAYAB_MOBILE_FOR_ANNOUNCEMENTS);
      if (adminMobile)
        await this.smsService.sendClickGuestMobileToAdmin(adminMobile, reserve.property.code, reserve.id);
    }

    if (!isPropertyExpired && reserve.status === PropertyReserveStatus.PENDING)
      await this.db.propertyReserve.update({
        where: { id: reserveId },
        data: {
          status: PropertyReserveStatus.OWNER_CALLED,
          owner_called_at: new Date(),
        },
      });
  }
}
