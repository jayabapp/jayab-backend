import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PropertyReserve, Prisma, Property } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyReserveUserDto } from './dto/create.dto';
import { UpdatePropertyReserveUserDto } from './dto/update.dto';
import { FindAllPropertyReserveUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import {
  PropertyReserveStatus,
  PropertyReserveStatusList,
} from 'src/property-reserve/common/interfaces/property-reserve-status.type';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import moment from 'moment-jalaali';
import { SmsService } from 'src/sms/sms.service';
import { maskedUserMobile } from 'src/common/helpers/masked-user-mobile.helper';
import { startOfDate, startOfToday } from 'src/common/helpers/date.helper';
import { RESERVE_TTL_MINUTES } from 'src/property-reserve/common/constants/reserve.constant';
import { isEmpty } from 'lodash';
import { PropertyJsonType, PropertySerializer } from 'src/property/serializer/property.serializer';
import { AvanakService } from 'src/sms/avanak.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PropertyReserveUserService {
  private ACTIVE_RESERVE_QUERY: Prisma.PropertyReserveWhereInput = {};
  constructor(
    private readonly db: PrismaService,
    private readonly smsService: SmsService,
    private readonly avanakService: AvanakService,
    private readonly configService: ConfigService,
  ) {
    this.ACTIVE_RESERVE_QUERY = {
      expired_at: null,
      canceled_at: null,
    };
  }

  /**
   * بررسی رزرو اکتیو روی یک ملک
   * @param userId
   * @param propertyId
   * @returns
   */
  async checkActiveReserveOnProperty(userId: number, propertyId: number): Promise<number> {
    const activeReserve = await this.db.propertyReserve.findFirst({
      where: {
        user_id: userId,
        property_id: propertyId,
        ...this.ACTIVE_RESERVE_QUERY,
      },
      select: { id: true },
    });

    return activeReserve?.id;
  }

  /**
   * بررسی شرایط ثبت رزرو جدید
   * @param userId
   * @returns
   */
  async canCreateReserves(userId: number): Promise<void> {
    const count = await this.db.propertyReserve.count({
      where: {
        user_id: userId,
        ...this.ACTIVE_RESERVE_QUERY,
      },
    });

    if (count >= 3) throw new BadRequestException('RESERVE6');
  }

  /**
   * create
   * @param dto
   * @returns
   */
  async create(
    dto: CreatePropertyReserveUserDto,
    userId: number,
  ): Promise<{ reserve: PropertyReserve; ownerId: number }> {
    const property = await this.db.property.findFirst({
      where: { id: dto.property_id, status: PropertyStatuses.PUBLISHED },
    });
    if (!property) throw new NotFoundException('NOT_FOUND');

    //check date
    const diff = moment(dto.check_out).diff(dto.check_in, 'd');
    if (diff === 0) throw new UnprocessableEntityException('RESERVE1');
    if (diff < 0) throw new UnprocessableEntityException('RESERVE2');
    if (moment().diff(dto.check_in, 'day') > 0) throw new UnprocessableEntityException('RESERVE3');

    const newPropertyReserve = await this.db.propertyReserve.create({
      data: { ...dto, user_id: userId, status: PropertyReserveStatus.PENDING },
    });
    return { reserve: newPropertyReserve, ownerId: property.owner_id };
  }

  /**
   * find all PropertyReserve
   * درخواست های فعال کاربر
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllPropertyReserveUserDto, userId: number): Promise<PropertyReserve[]> {
    let q: Prisma.PropertyReserveWhereInput = { user_id: userId };

    if (dto.type === 'active') q = { ...q, ...this.ACTIVE_RESERVE_QUERY };

    const list = await this.db.propertyReserve.findMany({
      where: q,
      include: {
        property: {
          select: {
            title: true,
            code: true,
            slug: true,
            has_pool: true,
            feature_image: true,
            subscription_expired_at: true,
            province: { select: { title: true } },
            city: { select: { title: true } },
            region: { select: { title: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const formatted = [];
    for (const item of list) {
      const obj = await this.serializer(item);
      formatted.push(obj);
    }
    return formatted;
  }

  /**
   * find one propertyReserve
   * @param propertyReserveId
   * @returns
   */
  async findById(propertyReserveId: number, userId: number): Promise<PropertyReserve> {
    const item = await this.db.propertyReserve.findFirst({
      where: { id: propertyReserveId },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');
    if (item.user_id !== userId) throw new ForbiddenException('RESERVE4');

    return item;
  }

  async findOne(propertyReserveId: number, userId: number): Promise<PropertyReserve> {
    const item = await this.db.propertyReserve.findFirst({
      where: { id: propertyReserveId },
      include: {
        property: {
          select: {
            title: true,
            code: true,
            slug: true,
            has_pool: true,
            feature_image: true,
            subscription_expired_at: true,
            province: { select: { title: true } },
            city: { select: { title: true } },
            region: { select: { title: true } },
          },
        },
      },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');
    if (item.user_id !== userId) throw new ForbiddenException('RESERVE4');

    const serialized = await this.serializer(item);
    return serialized;
  }

  /**
   * کنسل کردن درخواست توسط مهمان
   * @param propertyReserveId
   * @returns
   */
  async cancel(propertyReserveId: number): Promise<void> {
    await this.db.propertyReserve.update({
      where: { id: propertyReserveId },
      data: { canceled_at: new Date(), status: PropertyReserveStatus.CANCELED_BY_USER },
    });

    return;
  }

  /**
   * update
   * @param propertyReserveId
   * @param dto
   * @returns
   */
  async update(propertyReserveId: number, dto: UpdatePropertyReserveUserDto): Promise<PropertyReserve> {
    const item = await this.db.propertyReserve.update({
      where: { id: propertyReserveId },
      data: dto,
    });

    return item;
  }

  /**
   * ارسال پیامک به مالک بعد از ثبت درخواست رزرو
   * @param reserveId
   */
  async sendReserveSms(reserveId: number): Promise<void> {
    const reserve = await this.db.propertyReserve.findFirst({
      where: { id: reserveId },
      include: {
        property: {
          select: {
            title: true,
            subscription_expired_at: true,
            owner: { select: { user: { select: { mobile_number: true } } } },
          },
        },
        user: { select: { mobile_number: true } },
      },
    });
    if (!reserve) throw new NotFoundException('NOT_FOUND');

    const p = reserve.property;
    const isPropertyExpired = p.subscription_expired_at < startOfToday();
    const u = reserve.user;

    const title = `"${p.title.substring(0, 38)}"`;
    const guestMobile = isPropertyExpired ? maskedUserMobile(u.mobile_number) : u.mobile_number;

    const checkInMonth = moment(reserve.check_in).format('jMMMM');
    const checkOutMonth = moment(reserve.check_out).format('jMMMM');

    let date = `${moment(reserve.check_in).format('jDD')}`;
    if (checkInMonth != checkOutMonth) date += ` ${checkInMonth}`;
    date += ' تا ';
    date += `${moment(reserve.check_out).format('jDD')} `;
    date += checkOutMonth;

    const duration = `(${moment(reserve.check_out).diff(reserve.check_in, 'd')} شب)`;
    const guestsCount = `${reserve.guests_count} نفر`;

    console.log({ title, guestMobile, date, duration, guestsCount });

    await this.smsService.sendReserveToOwner(
      reserve.property.owner.user.mobile_number,
      title,
      guestMobile,
      date,
      duration,
      guestsCount,
    );
  }

  async sendReserveCall(reserveId: number): Promise<void> {
    //عدم تماس بین ساعت ۱۲ تا ۸ صبح
    const hour = moment().hour();
    if (hour >= 0 && hour < 8) return;

    const reserve = await this.db.propertyReserve.findFirst({
      where: { id: reserveId },
      include: {
        property: {
          select: {
            title: true,
            subscription_expired_at: true,
            owner: { select: { user: { select: { mobile_number: true } } } },
          },
        },
        user: { select: { mobile_number: true } },
      },
    });
    if (!reserve) throw new NotFoundException('NOT_FOUND');
    if (reserve.canceled_at) return;

    const p = reserve.property;
    const isPropertyExpired = p.subscription_expired_at < startOfToday();

    //طبق سناریو اگر اشتراک داشت نیاز به تماس صوتی نیست
    if (!isPropertyExpired) return;

    const reserveOwnerMessageId = await this.configService.get('avanak.reserveOwnerMessageId');
    await this.avanakService.quickCall(reserve.property.owner.user.mobile_number, reserveOwnerMessageId);
  }

  /**
   * منقضی کردن درخواست رزرو
   * @param reserveId
   * @returns
   */
  async expireReserve(reserveId: number): Promise<void> {
    const reserve = await this.db.propertyReserve.findFirst({
      where: { id: reserveId },
    });
    if (!reserve) return;
    await this.db.propertyReserve.update({ where: { id: reserveId }, data: { expired_at: new Date() } });
  }

  /**
   * آگهی های جایگزین در صورتی که مالک آگهی خودش رو تمدید نکنه
   * @param reserveId
   * @returns
   */
  async reserveRecommendation(reserveId: number): Promise<any> {
    const reserve = await this.db.propertyReserve.findFirst({
      where: { id: reserveId },
      include: { user: { select: { mobile_number: true } } },
    });
    if (!reserve) return;
    if (reserve.canceled_at) return;

    const p = await this.db.property.findFirst({ where: { id: reserve.property_id } });
    const isPropertyExpired = p.subscription_expired_at < startOfToday();
    if (!isPropertyExpired) return;

    let q: Prisma.PropertyWhereInput = {
      id: { not: p.id },
      subscription_expired_at: { gt: startOfToday() },
      is_authorized: true,
      province_id: p.province_id,
      city_id: p.city_id,
    };
    if (p.has_pool) q['has_pool'] = true;
    // if (p.region_id) q['region_id'] = p.region_id;

    let r1 = await this.db.property.findMany({ where: q, orderBy: { sort_order: 'desc' }, take: 3 });

    if (r1?.length < 3) {
      delete q.has_pool;
      r1 = await this.db.property.findMany({ where: q, orderBy: { sort_order: 'desc' }, take: 3 });
    }

    let links: string[] = [];
    for (const item of r1) {
      links.push(item.code);
    }

    if (!isEmpty(links))
      await this.smsService.sendRecommendationLinks(reserve.user.mobile_number, links, p.title);
  }

  /* --------------------------------- HELPERS -------------------------------- */
  async serializer(item: PropertyReserve & { property: Partial<Property> }): Promise<any> {
    const ttl = moment(item.created_at).add(RESERVE_TTL_MINUTES, 'minutes').diff(moment(), 's');
    const isChatEnabled = item.property.is_chat_enabled;
    const showCounter = item.status === PropertyReserveStatus.PENDING;

    return {
      ...item,
      ttl_seconds: ttl > 0 ? ttl : 0,
      show_counter: showCounter,
      status: PropertyReserveStatusList.find((e) => e.id === item.status),
      property: item.property,
      is_chat_enabled: isChatEnabled,
      is_subscription_expired: item.property.subscription_expired_at < startOfToday(),
    };
  }
}
