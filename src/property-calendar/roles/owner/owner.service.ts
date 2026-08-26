import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PropertyCalendar, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePropertyCalendarOwnerDto } from './dto/update.dto';
import { FindAllPropertyCalendarOwnerDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import {
  CreatePropertyCalendarNoteOwnerDto,
  UpdatePropertyAdvisorCommissionOwnerDto,
  UpdatePropertyDayPriceOwnerDto,
  UpdatePropertyReservedStatusOwnerDto,
} from './dto/create.dto';
import { JalaaliDateDto } from 'src/common/dto/jalaali-date.dto';
import { convertJalaaliDtoToDate, startOfDate } from 'src/common/helpers/date.helper';
import { DayHelper } from 'src/common/helpers/day.helper';

@Injectable()
export class PropertyCalendarOwnerService {
  constructor(
    private readonly db: PrismaService,
    private readonly dayHelper: DayHelper,
  ) {}

  /**
   * create and update note
   * @param dto
   * @returns
   */
  async upsertNote(propertyId: number, dto: CreatePropertyCalendarNoteOwnerDto): Promise<PropertyCalendar> {
    const rec = await this.findOrCreateByJalaaliDate(propertyId, dto);

    const newPropertyCalendar = await this.db.propertyCalendar.update({
      where: { id: rec.id },
      data: { note: dto.note },
    });
    return newPropertyCalendar;
  }

  /**
   * update reserve status.
   * @param propertyId
   * @param dto
   * @returns
   */
  async updateReserveStatus(
    propertyId: number,
    dto: UpdatePropertyReservedStatusOwnerDto,
  ): Promise<PropertyCalendar> {
    const rec = await this.findOrCreateByJalaaliDate(propertyId, dto);

    const newPropertyCalendar = await this.db.propertyCalendar.update({
      where: { id: rec.id },
      data: { is_reserved: !rec.is_reserved },
    });
    return newPropertyCalendar;
  }

  /**
   * update advisor commission for specific day
   * @param propertyId
   * @param dto
   * @returns
   */
  async updateAdvisorCommission(
    propertyId: number,
    dto: UpdatePropertyAdvisorCommissionOwnerDto,
  ): Promise<PropertyCalendar> {
    const rec = await this.findOrCreateByJalaaliDate(propertyId, dto);

    const newPropertyCalendar = await this.db.propertyCalendar.update({
      where: { id: rec.id },
      data: { advisor_commission: dto.advisor_commission },
    });
    return newPropertyCalendar;
  }

  /**
   * بازه قیمتی قابل قبول برای قیمت گذاری را برمیگرداند
   * @param propertyId
   * @param dto
   * @returns
   */
  async findAcceptablePriceRange(propertyId: number, dto: JalaaliDateDto): Promise<any> {
    const targetDay = await this.dayHelper.daysRange(convertJalaaliDtoToDate(dto), 1);
    const dailyPrice = await this.db.propertyDailyPrice.findFirst({ where: { property_id: propertyId } });

    const MAX_MIN_RATIO = 4; // adaptive
    const maxPrice = dailyPrice[targetDay.requestedDays[0]];

    const roundHelper = maxPrice / MAX_MIN_RATIO < 100000 ? Math.pow(10, 4) : Math.pow(10, 5);
    const minPrice = Math.floor(maxPrice / (MAX_MIN_RATIO * roundHelper)) * roundHelper;

    return {
      max_price: maxPrice * 2,
      min_price: minPrice,
      step: roundHelper,
    };
  }

  /**
   * update price for specific day
   * @param propertyId
   * @param dto
   * @returns
   */
  async updatePrice(propertyId: number, dto: UpdatePropertyDayPriceOwnerDto): Promise<PropertyCalendar> {
    if (dto.discounted_price > dto.price) throw new UnprocessableEntityException('PROPERTY_CALENDAR1');

    const rec = await this.findOrCreateByJalaaliDate(propertyId, dto);

    const effectivePrice = dto.discounted_price ?? dto.price;
    let percentage = 0;
    if (dto.discounted_price > 0)
      percentage = +(((dto.price - dto.discounted_price) / dto.price) * 100).toFixed(2);

    const newPropertyCalendar = await this.db.propertyCalendar.update({
      where: { id: rec.id },
      data: {
        price: dto.price,
        discounted_price: dto.discounted_price,
        effective_price: effectivePrice,
        discount_percentage: percentage,
      },
    });
    return newPropertyCalendar;
  }

  /**
   * find all PropertyCalendar accroding to year/month/day
   * @param dto
   * @returns
   */
  async findAll(
    propertyId: number,
    year: number,
    month: number,
    day?: number,
  ): Promise<Array<Partial<PropertyCalendar>>> {
    let q: Prisma.PropertyCalendarWhereInput = { property_id: propertyId, year, month };
    if (day) q = { ...q, day };

    const list = await this.db.propertyCalendar.findMany({
      where: q,
      omit: { property_id: true, id: true, created_at: true, updated_at: true },
    });

    return list;
  }

  /**
   * find one propertyCalendar
   * @param propertyCalendarId
   * @returns
   */
  async findOne(propertyCalendarId: number): Promise<PropertyCalendar> {
    const item = await this.db.propertyCalendar.findFirst({
      where: { id: propertyCalendarId },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  async findOrCreateByJalaaliDate(propertyId: number, dto: JalaaliDateDto): Promise<PropertyCalendar> {
    const item = await this.db.propertyCalendar.upsert({
      where: {
        property_id_day_month_year: {
          property_id: propertyId,
          day: dto.day,
          month: dto.month,
          year: dto.year,
        },
      },
      create: {
        property_id: propertyId,
        day: dto.day,
        month: dto.month,
        year: dto.year,
        date: convertJalaaliDtoToDate(dto),
      },
      update: {},
    });

    return item;
  }

  // /**
  //  * remove
  //  * @param propertyCalendarId
  //  */
  // async remove(propertyCalendarId: number): Promise<void> {
  //   await this.db.propertyCalendar.delete({ where: { id: propertyCalendarId } });
  // }
}
