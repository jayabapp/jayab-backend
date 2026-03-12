import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PropertyReserve, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyReserveUserDto } from './dto/create.dto';
import { UpdatePropertyReserveUserDto } from './dto/update.dto';
import { FindAllPropertyReserveUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { PropertyReserveStatus } from 'src/property-reserve/common/interfaces/property-reserve-status.type';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import moment from 'moment-jalaali';
import { SmsService } from 'src/sms/sms.service';
import { maskedUserMobile } from 'src/common/helpers/masked-user-mobile.helper';
import { startOfToday } from 'src/common/helpers/date.helper';

@Injectable()
export class PropertyReserveUserService {
  constructor(
    private readonly db: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreatePropertyReserveUserDto, userId: number): Promise<PropertyReserve> {
    const property = await this.db.property.findFirst({
      where: { id: dto.property_id, status: PropertyStatuses.PUBLISHED },
    });
    if (!property) throw new NotFoundException('NOT_FOUND');

    //check date
    const diff = moment(dto.check_out).diff(dto.check_in, 'd');
    if (diff === 0) throw new UnprocessableEntityException('RESERVE1');
    if (diff < 0) throw new UnprocessableEntityException('RESERVE2');

    const newPropertyReserve = await this.db.propertyReserve.create({
      data: { ...dto, user_id: userId, status: PropertyReserveStatus.PENDING },
    });
    return newPropertyReserve;
  }

  /**
   * find all PropertyReserve
   * درخواست های ۳۰ دقیقه گذشته کاربر
   * @param dto
   * @returns
   */
  async findAll(
    dto: FindAllPropertyReserveUserDto,
    userId: number,
  ): Promise<CursorPaginatedResult<PropertyReserve>> {
    const list = await cursorPaginate()<PropertyReserve, Prisma.PropertyReserveFindManyArgs>(
      this.db.propertyReserve,
      {
        where: { user_id: userId, created_at: { gt: moment().subtract(30, 'minutes').toDate() } },
        include: { property: { select: { title: true, slug: true, feature_image: true } } },
      },
      { cursor: dto.cursor },
    );

    const formatted = [];
    for (const item of list.data) {
      formatted.push({ ...item });
    }
    return list;
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

  // /**
  //  * remove
  //  * @param propertyReserveId
  //  */
  // async remove(propertyReserveId: number): Promise<void> {
  //   await this.db.propertyReserve.delete({ where: { id: propertyReserveId } });
  // }

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
}
