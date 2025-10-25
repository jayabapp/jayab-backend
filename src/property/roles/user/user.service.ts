import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Property, Prisma, PropertyOwnerAssistant, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllPropertyUserDto, PropertySearchSuggestuibUserDto } from './dto/find-all.dto';
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
import { ConfigService } from '@nestjs/config';
import { FindAdvisorShareDto, GenerateAdvisorShareDto } from './dto/advisor-share.dto';
import { AES, enc } from 'crypto-js';
import isJson from 'src/common/helpers/is-json.helper';
import { SmsService } from 'src/sms/sms.service';
import { paginate, PaginatedResult } from 'src/common/helpers/paginator';

@Injectable()
export class PropertyUserService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly db: PrismaService,
    private readonly propertySerializer: PropertySerializer,
    private readonly dayHelper: DayHelper,
    private readonly config: ConfigService,
    private readonly smsService: SmsService,
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
  ): Promise<PaginatedResult<PropertyArrayResType>> {
    let {
      code,
      province_id,
      cities = '',
      regions,
      total_bedrooms,
      total_guests,
      property_type,
      pattern,
      welfare,
      kitchen,
      cool_heat,
      neighborhood,
      guest_type,
      party,
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
      min_commission,
      max_commission,
      q,
      checkin,
      checkout,
    } = dto;

    const today = await this.dayHelper.today();
    let options = [];
    let optionsOR = [];

    //initial query
    let query: Prisma.PropertyWhereInput = this.validProperty();
    if (code) query = { ...query, code };

    /* ------------------------------------ q ----------------------------------- */
    if (q) query = { ...query, OR: this.preprocessSearchTerms(dto.q, 'slug') as Prisma.PropertyWhereInput[] };

    /* -------------------------------- province and city -------------------------------- */
    if (province_id && !isEmpty(cities))
      query = {
        ...query,
        OR: [{ city_id: { in: parseQueryNumberArray(cities) } }, { province_id: province_id }],
      };
    else if (province_id) query = { ...query, province_id };
    else if (!isEmpty(cities)) query = { ...query, city_id: { in: parseQueryNumberArray(cities) } };

    /* --------------------------------- regions -------------------------------- */
    if (!isEmpty(regions)) query = { ...query, region_id: { in: regions } };

    /* ----------------------------- total bedrooms ----------------------------- */
    if (total_bedrooms > 0) query = { ...query, bedrooms: { total_bedrooms: total_bedrooms } };

    /* ----------------------------- total guests ----------------------------- */
    if (total_guests > 0) query = { ...query, max_capacity: { gte: total_guests } };

    /* ------------------------------ options query ----------------------------- */
    if (property_type) options.push(...parseQueryNumberArray(property_type));
    if (pattern) options.push(...parseQueryNumberArray(pattern));
    if (welfare) options.push(...parseQueryNumberArray(welfare));
    if (kitchen) options.push(...parseQueryNumberArray(kitchen));
    if (cool_heat) options.push(...parseQueryNumberArray(cool_heat));
    if (neighborhood) options.push(...parseQueryNumberArray(neighborhood));
    if (guest_type) options.push(...parseQueryNumberArray(guest_type));
    if (!isEmpty(entertainment)) options.push(...parseQueryNumberArray(entertainment));

    /* --------------------------- نوع های استخر و مهمانی - OR --------------------------- */
    if (party) optionsOR.push(...parseQueryNumberArray(party));
    if (pool_type) optionsOR.push(...parseQueryNumberArray(pool_type));

    // console.log({ optionsOR, dto });

    if (!isEmpty(optionsOR)) {
      query = {
        ...query,
        AND: [{ options_array: { hasEvery: options } }, { options_array: { hasSome: optionsOR } }],
      };
    } else query = { ...query, options_array: { hasEvery: options } };

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
    if (min_price >= 0 || max_price >= 0) {
      query = {
        ...query,
        daily_price: {
          AND: [
            { [today]: { gte: min_price ?? 0 } },
            { [today]: { lte: max_price || Number.MAX_SAFE_INTEGER } },
          ],
        },
      };
    }

    /* ------------------------------ building area ----------------------------- */
    if (min_building_area >= 0 || max_building_area >= 0) {
      query = {
        ...query,
        building_area: { gte: min_building_area ?? 0, lte: max_building_area || 100_000_000 },
      };
    }

    if (min_commission >= 0 || max_commission >= 0)
      query = { ...query, advisor_commission: { gte: min_commission || 0, lte: max_commission || 100 } };

    /* -------------------------------- bookmark -------------------------------- */
    if (propertyIds) query = { ...query, id: { in: propertyIds } };

    /* ------------------------------ RESERVE DAYS ------------------------------ */
    if (checkin && checkout && moment(checkin).isValid() && moment(checkout).isValid)
      query = {
        ...query,
        AND: [
          {
            calendar: {
              none: {
                date: { gte: startOfDate(checkin), lt: startOfDate(checkout) },
                is_reserved: true,
              },
            },
          },
          { calendar: query.calendar || {} }, //to prevent overwrite discount calendar query
        ],
      };

    /* ---------------------------------- CALENDAR INCLUDE ---------------------------------- */
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
        orderByQuery = { sort_order: 'desc' };
        break;
      case 'price_asc':
        orderByQuery = { daily_price: { [today]: 'asc' } };
        break;
      case 'price_desc':
        orderByQuery = { daily_price: { [today]: 'desc' } };
        break;
      case 'commission_desc':
        orderByQuery = { advisor_commission: 'desc' };
        break;
      default:
        orderByQuery = { sort_order: 'desc' };
        break;
    }

    const list = await paginate()<PropertyJsonType, Prisma.PropertyFindManyArgs>(
      this.db.property,
      {
        where: query,
        include: {
          feature_image: true,
          province: { select: { title: true } },
          city: { select: { title: true } },
          property_options: {
            where: { option: { deleted_at: null } },
            select: { option: { select: { title: true, group: true } } },
          },
          daily_price: true,
          calendar: { where: calendarDateQuery, orderBy: { date: 'asc' } },
          bedrooms: { select: { total_bedrooms: true } },
          _count: { select: { attachments: true } },
        },
        orderBy: orderByQuery,
      },
      { page: dto.page, perPage: dto.per_page },
    );

    const serialized = await this.propertySerializer.toArray(list.data, today, isAdvisor, false);
    return { data: serialized, meta: list.meta };
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
        property_options: {
          where: { option: { deleted_at: null } },
          select: { option: { select: { title: true, group: true } } },
        },
        bedrooms: true,
        daily_price: true,
        calendar: { where: calendarDateQuery, orderBy: { date: 'asc' } },
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

  async findContactInfo(
    propertySlug: string,
  ): Promise<{ owner: any; list: Partial<PropertyOwnerAssistant>[] }> {
    const code = this.checkSlug(propertySlug);

    const list = await this.db.propertyOwnerAssistant.findMany({
      where: { property: { ...this.validProperty(), code } },
      select: {
        assistant_full_name: true,
        assistant_mobile_number: true,
        is_owner: true,
        property_id: true,
      },
      orderBy: { is_owner: 'desc' },
    });

    const property = await this.db.property.findUnique({
      where: { code },
      select: { owner: { select: { user: { select: { profile_image: true } } } } },
    });

    const owner = {
      selfie_image: property.owner?.user?.profile_image,
    };

    return { owner, list };
  }

  async storeCallLog(propertyId: number, user: User, ownerMobile: string): Promise<void> {
    const userId = user.id;
    const todayRec = await this.db.callLog.findFirst({
      where: {
        property_id: propertyId,
        user_id: userId,
        created_at: { gte: moment().utc().startOf('day').toDate() },
      },
      select: { id: true, attempts: true, created_at: true },
    });

    if (todayRec)
      await this.db.callLog.update({ where: { id: todayRec.id }, data: { attempts: { increment: 1 } } });
    else {
      await this.db.callLog.create({
        data: { property_id: propertyId, user_id: userId, attempts: 1 },
      });
      const maskedUserMobile = user.mobile_number
        .split('')
        .map((char, i) => {
          if (i > 6 && i <= 8) return 'x';
          return char;
        })
        .join('');

      if (user?.mobile_number !== ownerMobile) {
        this.smsService.sendCallLogToOwner(ownerMobile, maskedUserMobile);
      }
    }
  }

  validProperty() {
    return {
      status: PropertyStatuses.PUBLISHED,
      subscription_expired_at: { gte: startOfToday() },
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

  /* -------------------------------------------------------------------------- */
  /*                                    SHARE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * ابتدا یک لینک با ای دی ملک و مشاور و المان هایی که باید نمایش داده بشه میسازیم
   * رته به دست امده رو رمزنگاری میکنیم و به کلاینت برمیگردونیم
   * کلاینت با زدن لینک به سایت مشاوران میره. در اونجا دیتا  رو به ای پی ای خود نکست میدیم و از اونجا به جایاب میفرستیم
   * داده رو باز میکنیم و دیتای مورد نظر رو به سایت برمیگردونیم
   * @param propertyId
   * @param advisorId
   * @param dto
   * @returns
   */
  async generateAdvisorShare(
    propertyId: number,
    advisorId: number,
    dto: GenerateAdvisorShareDto,
  ): Promise<string> {
    const advisorShareUrl = this.config.get('url.advisorShareUrl');

    // const expireAt = moment().add(1, 'day').format('YYYY-MM-DD');

    const encryptedParams = await this.encryptShareLink(propertyId, advisorId, dto.elements);

    const url = `${advisorShareUrl}/s?content=${encryptedParams}`;

    return url;
  }
  async findAdvisorShareData(dto: FindAdvisorShareDto): Promise<any> {
    const decrypted = await this.decryptShareLink(dto.content);
    if (!decrypted) throw new BadRequestException();

    const data = JSON.parse(decrypted);
    const prop = await this.db.property.findUnique({
      where: { id: data.propertyId },
      select: { slug: true, attachments: true, feature_image: true },
    });
    const property = await this.findOne(prop.slug, false);

    const advisor = await this.db.advisor.findUnique({
      where: { id: data.advisorId },
      select: { user: { select: { full_name: true, mobile_number: true, profile_image: true } } },
    });
    return { property, advisor, elements: data.elements?.split(',') };
  }

  async encryptShareLink(
    propertyId: number,
    advisorId: number,
    elements: string,
    expireAt?: string,
  ): Promise<string> {
    const secretKey = this.config.get('project.advisorShareLinkSecret');
    const obj = {
      propertyId,
      advisorId,
      elements,
    };
    const sentence = JSON.stringify(obj);

    const cipher = AES.encrypt(sentence, secretKey).toString();

    return cipher;
  }

  async decryptShareLink(sentence: string): Promise<string> {
    const secretKey = this.config.get('project.advisorShareLinkSecret');

    const bytes = AES.decrypt(sentence, secretKey);
    const decrypted = bytes.toString(enc.Utf8);

    return decrypted;
  }

  /* ---------------------------- SEARCH SUGGESTION --------------------------- */
  async searchSuggestions(dto: PropertySearchSuggestuibUserDto): Promise<any> {
    const exactProperty = await this.db.property.findFirst({
      where: { title: dto.q, ...this.validProperty() },
      select: { id: true, title: true, slug: true },
    });

    const properties = await this.db.property.findMany({
      where: {
        ...this.validProperty(),
        OR: this.preprocessSearchTerms(dto.q, 'slug') as Prisma.PropertyWhereInput[],
      },
      select: { id: true, title: true, slug: true },
      take: 5,
    });

    const cities = await this.db.city.findMany({
      where: {
        OR: this.preprocessSearchTerms(dto.q, 'title') as Prisma.CityWhereInput[],
        parent_id: { not: null },
      },
      select: { id: true, title: true, slug: true },
      take: 5,
    });

    const landings = await this.db.landingPage.findMany({
      where: {
        OR: this.preprocessSearchTerms(dto.q, 'title') as Prisma.LandingPageWhereInput[],
      },
      select: { id: true, title: true, url: true },
      take: 5,
    });

    return {
      properties: !!exactProperty ? [exactProperty].concat(properties) : properties,
      cities,
      landings,
    };
  }

  /* --------------------------------- HELPERS -------------------------------- */
  /**
   * prepare text for search
   * @param searchTerm
   * @param column
   * @returns
   */
  preprocessSearchTerms = (searchTerm: string, column: string): string[] => {
    const specialChars = /[()|&:*!]/g;
    const strings = searchTerm.trim().replace(specialChars, ' ').split(/\s+/);
    let query = [];
    for (const text of strings) {
      query.push({ [column]: { contains: text } });
    }
    return query;
  };

  /* -------------------------------------------------------------------------- */
  /**
   * faker
   * @param propertyId
   */
  async duplicate(propertyId: number): Promise<void> {
    return;
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
