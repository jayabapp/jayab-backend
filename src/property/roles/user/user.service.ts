import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Property, Prisma, PropertyOwnerAssistant } from '@prisma/client';
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
import { endOfDate, startOfDate, startOfToday } from 'src/common/helpers/date.helper';
import { parseQueryNumberArray } from 'src/common/helpers/parse-query-array.pipe';
import { Redis } from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { userPropertyViewKey } from 'src/common/helpers/redis.helper';
import moment from 'moment-jalaali';

@Injectable()
export class PropertyUserService {
  constructor(
    private readonly db: PrismaService,
    private readonly propertySerializer: PropertySerializer,
    private readonly dayHelper: DayHelper,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  /**
   * find all Property
   * @param dto
   * @returns
   */
  async findAll(
    dto: FindAllPropertyUserDto,
    propertyIds?: number[],
  ): Promise<CursorPaginatedResult<PropertyArrayResType>> {
    const {
      code,
      province_id,
      cities,
      regions,
      total_bedrooms,
      total_guests,
      property_type,
      pool_type,
      entertainment,
      has_pool,
      has_discount,
      is_premium,
      title,
      start_day,
      num_days,
      min_price,
      max_price,
    } = dto;
    // console.log({ dto });

    // let startDay = null;

    // if (isJson(start_day)) {
    //   startDay = JSON.parse(dto.start_day) as DayDto;
    //   if (!startDay?.day || !startDay?.month || !startDay?.year) startDay = null;
    // }

    //initial query
    let query: Prisma.PropertyWhereInput = this.validProperty();
    if (code) query = { ...query, code };

    /* -------------------------------- province -------------------------------- */
    if (province_id) query = { ...query, province_id };

    /* --------------------------------- cities --------------------------------- */
    if (!isEmpty(cities)) query = { ...query, city_id: { in: parseQueryNumberArray(cities) } };

    /* --------------------------------- regions -------------------------------- */
    if (!isEmpty(regions)) query = { ...query, region_id: { in: regions } };

    /* ----------------------------- total bedrooms ----------------------------- */
    if (total_bedrooms >= 0) query = { ...query, bedrooms: { total_bedrooms: total_bedrooms } };

    /* ----------------------------- total guests ----------------------------- */
    if (total_guests >= 0) query = { ...query, std_capacity: { gte: total_guests } };

    /* ------------------------------ options query ----------------------------- */
    let options = [];
    if (property_type) options.push(property_type);

    if (!isEmpty(entertainment)) options.push(...parseQueryNumberArray(entertainment));

    /* --------------------------- نوع های استخر - OR --------------------------- */
    if (!isEmpty(pool_type)) options.push(...parseQueryNumberArray(pool_type));

    /* ------------------------------ فقط استخردار ------------------------------ */
    if (has_pool === 1) query = { ...query, has_pool: true };
    else if (has_pool === 0) query = { ...query, has_pool: false };

    /* -------------------------------- تخفیف دار ------------------------------- */
    if (has_discount === 1)
      query = { ...query, calendar: { some: { date: startOfToday(), discount_percentage: { gt: 0 } } } };

    /* ------------------------------ ملک های ویژه ------------------------------ */
    if (is_premium === 1) query = { ...query, has_blue_tick: true };

    /* ---------------------------------- title --------------------------------- */
    if (title) query = { ...query, title: { contains: title } };

    // if (min_price >= 0 && max_price >= 0)
    //   query = {
    //     ...query,
    //     daily_price: { AND: [{ normal: { gte: min_price } }, { normal: { lte: max_price } }] },
    //   };
    // console.log({ options });

    /* -------------------------------- bookmark -------------------------------- */
    if (propertyIds) query = { ...query, id: { in: propertyIds } };

    /* ---------------------------------- LIST ---------------------------------- */
    const calendarDateQuery: Prisma.PropertyCalendarWhereInput = {
      date: { gte: startOfToday(), lt: startOfDate(moment().add(8, 'days').toDate()) },
    };

    const list = await cursorPaginate()<PropertyJsonType, Prisma.PropertyFindManyArgs>(
      this.db.property,
      {
        where: {
          options_array: { hasEvery: options },
          ...query,
        },
        include: {
          feature_image: true,
          province: { select: { title: true } },
          city: { select: { title: true } },
          property_options: true,
          daily_price: true,
          calendar: { where: calendarDateQuery },
          bedrooms: { select: { total_bedrooms: true } },
          _count: { select: { attachments: true } },
          favorites: true,
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
    const code = this.checkSlug(propertySlug);
    const calendarDateQuery: Prisma.PropertyCalendarWhereInput = {
      date: { gte: startOfToday(), lt: startOfDate(moment().add(8, 'days').toDate()) },
    };

    const item = await this.db.property.findFirst({
      where: { ...this.validProperty(), code },
      include: {
        feature_image: true,
        attachments: true,
        province: { select: { title: true } },
        city: { select: { title: true } },
        property_options: { select: { option: { select: { title: true, group: true } } } },
        bedrooms: true,
        daily_price: true,
        calendar: { where: calendarDateQuery },
        // assistants: true,
        description: true,
        favorites: true,
      },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    const today = await this.dayHelper.today();
    const serialized = await this.propertySerializer.toJSON(item, today, false);
    return serialized;
  }

  /**
   * find by id
   * @param id
   * @returns
   */
  async findById(id: number): Promise<void> {
    const item = await this.db.property.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');
  }

  async findContactInfo(propertySlug: string): Promise<Partial<PropertyOwnerAssistant>[]> {
    const code = this.checkSlug(propertySlug);

    const list = await this.db.propertyOwnerAssistant.findMany({
      where: { property: { ...this.validProperty(), code } },
      select: { assistant_full_name: true, assistant_mobile_number: true, is_owner: true },
    });

    return list;
  }

  validProperty() {
    return {
      status: PropertyStatuses.PUBLISHED,
      subscription_expired_at: { gte: new Date() },
    };
  }

  async findOnPartial(propertyId: number, select: Prisma.PropertySelect): Promise<Partial<Property>> {
    const property = await this.db.property.findFirst({
      where: { id: propertyId, ...this.validProperty() },
      select: select,
    });
    return property;
  }

  checkSlug(slug: string): string {
    const code = slug.split('-')?.[0];
    if (!code) throw new BadRequestException('NOT_FOUND');
    return code;
  }

  /**
   *
   * @param propertyId
   * @param fingerprint
   * @returns
   */
  async updateViewStatistics(propertyId: number, fingerprint: string): Promise<void> {
    /*  */
    const redisKey = userPropertyViewKey(propertyId, fingerprint);
    const userViewedPost = await this.redis.get(redisKey);
    if (userViewedPost) return;
    await this.redis.set(redisKey, 1, 'EX', 86400);

    const now = startOfToday();

    // create statistics
    await this.db.propertyStatistics.upsert({
      where: { property_id_date: { property_id: propertyId, date: now } },
      update: { view_count: { increment: 1 } },
      create: { date: now, property_id: propertyId, view_count: 1 },
    });
  }
}
