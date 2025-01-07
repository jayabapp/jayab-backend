import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyCalendar, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePropertyCalendarOwnerDto } from './dto/update.dto';
import { FindAllPropertyCalendarOwnerDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { CreatePropertyCalendarNoteOwnerDto, CreatePropertyReservedDaysOwnerDto } from './dto/create.dto';
import { JalaaliDateDto } from 'src/common/dto/jalaali-date.dto';
import { convertJalaaliDtoToDate, startOfDate } from 'src/common/helpers/date.helper';

@Injectable()
export class PropertyCalendarOwnerService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create and update note
   * @param dto
   * @returns
   */
  async createNote(propertyId: number, dto: CreatePropertyCalendarNoteOwnerDto): Promise<PropertyCalendar> {
    const rec = await this.findOrCreateByJalaaliDate(propertyId, dto);

    const newPropertyCalendar = await this.db.propertyCalendar.update({
      where: { id: rec.id },
      data: { note: dto.note },
    });
    return newPropertyCalendar;
  }

  /**
   * create/ update reserve status.
   * @param propertyId
   * @param dto
   * @returns
   */
  async createReserve(
    propertyId: number,
    dto: CreatePropertyReservedDaysOwnerDto,
  ): Promise<PropertyCalendar> {
    const rec = await this.findOrCreateByJalaaliDate(propertyId, dto);

    const newPropertyCalendar = await this.db.propertyCalendar.update({
      where: { id: rec.id },
      data: { is_reserved: !rec.is_reserved },
    });
    return newPropertyCalendar;
  }

  /**
   * find all PropertyCalendar
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllPropertyCalendarOwnerDto): Promise<CursorPaginatedResult<PropertyCalendar>> {
    const list = await cursorPaginate()<PropertyCalendar, Prisma.PropertyCalendarFindManyArgs>(
      this.db.propertyCalendar,
      {},
      { cursor: dto.cursor },
    );

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

    console.log({ item, dto });

    return item;
  }

  /**
   * update
   * @param propertyCalendarId
   * @param dto
   * @returns
   */
  async update(propertyCalendarId: number, dto: UpdatePropertyCalendarOwnerDto): Promise<PropertyCalendar> {
    const item = await this.db.propertyCalendar.update({
      where: { id: propertyCalendarId },
      data: dto,
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
