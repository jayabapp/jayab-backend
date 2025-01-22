import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Property, Prisma, PropertyOwnerAssistant } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllPropertyUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { isEmpty, omit, random } from 'lodash';
import {
  PropertyArrayResType,
  PropertyJsonType,
  PropertyResType,
  PropertySerializer,
} from 'src/property/serializer/property.serializer';
import { DayHelper } from 'src/common/helpers/day.helper';
import { startOfDate, startOfToday } from 'src/common/helpers/date.helper';
import { parseQueryNumberArray } from 'src/common/helpers/parse-query-array.pipe';
import { Redis } from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { userPropertyViewKey } from 'src/common/helpers/redis.helper';
import moment from 'moment-jalaali';
import { slugify } from 'src/common/helpers/slugify';
import Num2persian from 'src/common/helpers/Num2Persian';

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
    isAdvisor: boolean = false,
    propertyIds?: number[],
  ): Promise<CursorPaginatedResult<PropertyArrayResType>> {
    let {
      code,
      province_id,
      cities = '',
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
      min_price,
      max_price,
      max_building_area,
      min_building_area,
    } = dto;

    const today = await this.dayHelper.today();
    let options = [];

    /**
     * Ex: jayab.com/s/ramsar-lahijan/billiard
     */
    // if (dto.keys) {
    //   const keys = parseQueryStringArray(dto.keys);
    //   const c = await this.db.city.findMany({
    //     where: { slug: { in: keys } },
    //     select: { id: true },
    //   });
    //   if (c.length > 0) {
    //     const cid = c.map((i) => i.id).join(',');
    //     cities = cities ? `${cities},${cid}` : cid;
    //   }
    //   const o = await this.db.propertyOption.findMany({
    //     where: { key: { in: keys } },
    //     select: { id: true },
    //   });
    //   if (o.length > 0) {
    //     options.push(...o.map((i) => i.id));
    //   }
    //   console.log({ keys, c, o, cities, options });
    // }
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
    if (total_bedrooms > 0) query = { ...query, bedrooms: { total_bedrooms: total_bedrooms } };

    /* ----------------------------- total guests ----------------------------- */
    if (total_guests > 0) query = { ...query, std_capacity: { gte: total_guests } };

    /* ------------------------------ options query ----------------------------- */

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

    /* ---------------------------------- price --------------------------------- */
    if (min_price >= 0 && max_price >= 0)
      query = {
        ...query,
        daily_price: { AND: [{ normal: { gte: min_price } }, { normal: { lte: max_price } }] },
      };

    /* ------------------------------ building area ----------------------------- */
    if (min_building_area >= 0 && max_building_area >= 0)
      query = { ...query, building_area: { gte: min_building_area, lte: max_building_area } };

    /* -------------------------------- bookmark -------------------------------- */
    if (propertyIds) query = { ...query, id: { in: propertyIds } };

    /* ---------------------------------- LIST ---------------------------------- */
    const calendarDateQuery: Prisma.PropertyCalendarWhereInput = {
      date: { gte: startOfToday(), lt: startOfDate(moment().add(8, 'days').toDate()) },
    };

    /* -------------------------------- ORDER BY -------------------------------- */

    let orderByQuery: Prisma.PropertyOrderByWithRelationInput | Prisma.PropertyOrderByWithRelationInput[] =
      [];
    switch (dto.sort_type) {
      case 'popular':
        orderByQuery = { favorite_count: 'desc' };
        break;
      case 'newset':
        orderByQuery = { created_at: 'desc' };
        break;
      case 'price_asc':
        orderByQuery = { daily_price: { [today]: 'asc' } };
        break;
      case 'price_desc':
        orderByQuery = { daily_price: { [today]: 'desc' } };
        break;
      default:
        orderByQuery = { sort_order: 'desc' };
        break;
    }

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
        },
        orderBy: orderByQuery,
      },
      { cursor: dto.cursor, perPage: dto.per_page },
    );

    const serialized = await this.propertySerializer.toArray(list.data, today, isAdvisor);
    return { data: serialized };
  }

  /**
   * find one property
   * @param propertyId
   * @returns
   */
  async findOne(propertySlug: string, isAdvisor: boolean): Promise<PropertyResType> {
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
        description: true,
        favorites: true,
      },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    const today = await this.dayHelper.today();
    const serialized = await this.propertySerializer.toJSON(item, today, isAdvisor);
    return serialized;
  }

  /**
   * find by id
   * @param id
   * @returns
   */
  async findById(id: number): Promise<Property> {
    const item = await this.db.property.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');
    return item;
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

  async duplicate(propertyId: number): Promise<void> {
    const propPure = await this.db.property.findUnique({ where: { id: propertyId }, omit: { id: true } });
    const prop = await this.db.property.findUnique({
      where: { id: propertyId },
      include: {
        property_options: true,
        bedrooms: true,
        daily_price: true,
        description: true,
      },
    });

    const titleMock = ['ویلای', 'سوییت', 'آپارتمان'];

    for (let i = 0; i < 100; i++) {
      const code = `${random(10_000, 99_999).toString()}`;
      const title = `${titleMock[random(0, titleMock.length - 1)]} ${Num2persian(i + 1)}`;
      const slug = `${code}-${slugify(title)}`;
      const cityId = random(32, 165);
      const province = await this.db.city.findUnique({ where: { id: cityId } });

      await this.db.$transaction(async (tx) => {
        const newProp = await tx.property.create({
          data: {
            ...propPure,
            title: title,
            slug: slug,
            slug_hash: `${random(0, 1_000_000_000) + random(0, 1_000).toString(16)}`,
            code,
            city_id: cityId,
            province_id: province?.parent_id,
            is_chat_enabled: random(0, 1) === 0 ? false : true,
            has_pool: random(0, 1) === 0 ? false : true,
            has_blue_tick: random(0, 1) === 0 ? false : true,
            std_capacity: random(1, 10),
            advisor_commission: random(5, 50),
            building_area: random(50, 200),
            floor: random(1, 3),
            feature_image_id: random(5, 20),
            daily_price: { create: { ...omit(prop?.daily_price, ['id', 'property_id']) } },
            bedrooms: { create: { ...omit(prop?.bedrooms, ['id', 'property_id']) } },
            description: { create: { ...omit(prop?.description, ['id', 'property_id']) } },
            attachments: { connect: [{ id: random(5, 20) }, { id: random(5, 20) }, { id: random(5, 20) }] },
          },
        });
        await tx.optionsOnProperty.createMany({
          data: prop?.property_options.map((item) => ({
            property_id: newProp.id,
            option_id: item.option_id,
          })),
        });
      });
    }
  }
}
