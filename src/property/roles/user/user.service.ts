import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import {
  PropertyArrayResType,
  PropertyJsonType,
  PropertyResType,
  PropertySerializer,
} from 'src/property/serializer/property.serializer';
import { DayHelper } from 'src/common/helpers/day.helper';
import { startOfToday } from 'src/common/helpers/date.helper';

@Injectable()
export class PropertyUserService {
  constructor(
    private readonly db: PrismaService,
    private readonly propertySerializer: PropertySerializer,
    private readonly dayHelper: DayHelper,
  ) {}

  /**
   * find all Property
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllPropertyUserDto): Promise<CursorPaginatedResult<PropertyArrayResType>> {
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
      subscription_expired_at: { gte: new Date() },
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

    /* ---------------------------------- LIST ---------------------------------- */
    const list = await cursorPaginate()<PropertyJsonType, Prisma.PropertyFindManyArgs>(
      this.db.property,
      {
        where: {
          AND: optionsQuery,
          ...query,
        },
        include: {
          feature_image: true,
          province: { select: { title: true } },
          city: { select: { title: true } },
          property_options: true,
          daily_price: true,
          calendar: { where: { date: startOfToday() } },
          bedrooms: { select: { total_bedrooms: true } },
          _count: { select: { attachments: true } },
        },
      },
      { cursor: dto.cursor },
    );

    const today = await this.dayHelper.today();
    const serialized = await this.propertySerializer.toArray(list.data, today, false);
    return { data: serialized };
  }

  /**
   * find one property
   * @param propertyId
   * @returns
   */
  async findOne(propertySlug: string): Promise<PropertyResType> {
    const code = propertySlug.split('-')?.[0];
    if (!code) throw new BadRequestException('NOT_FOUND');

    const item = await this.db.property.findFirst({
      where: { code },
      include: {
        feature_image: true,
        attachments: true,
        province: { select: { title: true } },
        city: { select: { title: true } },
        property_options: { select: { option: { select: { title: true, group: true } } } },
        bedrooms: true,
        daily_price: true,
        calendar: { where: { date: startOfToday() } },
        // assistants: true,
        description: true,
      },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    const today = await this.dayHelper.today();
    const serialized = await this.propertySerializer.toJSON(item, today, false);
    return serialized;
  }
}
