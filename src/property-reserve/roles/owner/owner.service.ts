import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyReserve, Prisma, Property, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllPropertyReserveOwnerDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import moment from 'moment-jalaali';
import { RESERVE_TTL_MINUTES } from 'src/property-reserve/common/constants/reserve.constant';
import { startOfDate, startOfToday } from 'src/common/helpers/date.helper';
import { maskedUserMobile } from 'src/common/helpers/masked-user-mobile.helper';
import {
  PropertyReserveStatus,
  PropertyReserveStatusList,
} from 'src/property-reserve/common/interfaces/property-reserve-status.type';
import { SmsService } from 'src/sms/sms.service';
import { SettingAdminService } from 'src/setting/roles/admin/admin.service';
import { SettingKey } from 'src/setting/common/interfaces/settings.interface';
import { PropertyJsonType, PropertySerializer } from 'src/property/serializer/property.serializer';
import { DayHelper } from 'src/common/helpers/day.helper';

@Injectable()
export class PropertyReserveOwnerService {
  constructor(
    private readonly db: PrismaService,
    private readonly smsService: SmsService,
    private readonly setting: SettingAdminService,
    private readonly propertySerializer: PropertySerializer,
    private readonly dayHelper: DayHelper,
  ) {}

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
              province: { select: { title: true } },
              city: { select: { title: true } },
              region: { select: { title: true } },
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
        property: item.property,
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

  /**
   * تعداد درخواست فعال برای بج سمت کلاینت
   * @param ownerId
   * @returns
   */
  async countAllActive(ownerId: number): Promise<number> {
    return await this.db.propertyReserve.count({
      where: { property: { owner_id: ownerId }, expired_at: null, canceled_at: null },
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                    EVENT                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * ارسال پیامک به ادمین
   * @param reserveId
   * @returns
   */
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

    //تا دوبار پیامک میفرستیم
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
