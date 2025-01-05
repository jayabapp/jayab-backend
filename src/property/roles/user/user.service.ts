import { Injectable, NotFoundException } from '@nestjs/common';
import { Property, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllPropertyUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { OptionConnect } from 'src/common/interfaces/option-connect.interface';
import isJson from 'src/common/helpers/is-json.helper';
import { DayDto } from '../owner/dto/update-property.dto';
import { isEmpty } from 'lodash';
import { RentType } from 'src/property/common/types/property-rent-types.type';

@Injectable()
export class PropertyUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all Property
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllPropertyUserDto): Promise<CursorPaginatedResult<Property>> {
    const {
      code,
      province_id,
      cities,
      regions,
      total_bedrooms,
      property_type,
      pool_type,
      entertainment,
      with_pool,
      title,
      start_day,
      num_days,
      min_price,
      max_price,
    } = dto;

    let startDay = null;

    if (isJson(start_day)) {
      startDay = JSON.parse(dto.start_day) as DayDto;
      if (!startDay?.day || !startDay?.month || !startDay?.year) startDay = null;
    }

    //initial query
    let query: Prisma.PropertyWhereInput = {
      status: PropertyStatuses.PUBLISHED,
      // subscription: { expire_at: { gte: new Date() } }, بعد از توسعه مربوط به حذف اشتراک اجباری برای ملک این قسمت غیر فعال شد
      // property_authorize:{status:CommonStatuses.APPROVED}
    };
    if (code) query = { ...query, code };

    /* -------------------------------- province -------------------------------- */
    if (province_id) query = { ...query, province_id };

    /* --------------------------------- cities --------------------------------- */
    if (!isEmpty(cities)) query = { ...query, city_id: { in: cities } };

    /* --------------------------------- regions -------------------------------- */
    if (!isEmpty(regions)) query = { ...query, region_id: { in: regions } };

    /* ----------------------------- total bedrooms ----------------------------- */
    if (total_bedrooms >= 0) query = { ...query, bedrooms: { total_bedrooms: total_bedrooms } };

    /* -------------------------------- RENT TYPE ------------------------------- */
    if (dto.rent_type?.includes(RentType.DAILY)) query = { ...query, NOT: { daily_price: null } };

    /* ------------------------------ options query ----------------------------- */
    let options = [];
    if (property_type) options.push(property_type);

    if (!isEmpty(entertainment)) options = options.concat(entertainment);
    let optionsQuery = [];
    options.map((e) => optionsQuery.push({ property_options: { some: { option_id: e } } }));

    /* --------------------------- نوع های استخر - OR --------------------------- */
    if (!isEmpty(pool_type))
      query = { ...query, property_options: { some: { option_id: { in: pool_type } } } };

    /* ------------------------------ فقط استخردار ------------------------------ */
    if (with_pool != undefined) query = { ...query, has_pool: with_pool };

    /* ---------------------------------- title --------------------------------- */
    if (title) query = { ...query, title: { contains: title } };

    if (min_price >= 0 && max_price >= 0)
      query = {
        ...query,
        daily_price: { AND: [{ normal: { gte: min_price } }, { normal: { lte: max_price } }] },
      };

    const list = await cursorPaginate()<Property, Prisma.PropertyFindManyArgs>(
      this.db.property,
      {},
      { cursor: dto.cursor },
    );

    return list;
  }

  /**
   * find one property
   * @param propertyId
   * @returns
   */
  async findOne(propertyId: number): Promise<Property> {
    const item = await this.db.property.findFirst({
      where: { id: propertyId },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }
}
