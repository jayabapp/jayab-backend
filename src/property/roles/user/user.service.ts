import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Property, PropertyOwnerAssistant, User } from '@prisma/client';
import { AES, enc } from 'crypto-js';
import { Redis } from 'ioredis';
import { groupBy, isEmpty, omit, orderBy, random } from 'lodash';
import moment from 'moment-jalaali';
import { startOfDate, startOfToday } from 'src/common/helpers/date.helper';
import { DayHelper } from 'src/common/helpers/day.helper';
import { maskedUserMobile } from 'src/common/helpers/masked-user-mobile.helper';
import Num2persian from 'src/common/helpers/Num2Persian';
import { paginate, PaginatedResult } from 'src/common/helpers/paginator';
import { parseQueryNumberArray } from 'src/common/helpers/parse-query-array.pipe';
import { sanitizeText, slugify } from 'src/common/helpers/slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import {
  PropertyArrayResType,
  PropertyJsonType,
  PropertyResType,
  PropertySerializer,
} from 'src/property/serializer/property.serializer';
import { SettingKey } from 'src/setting/common/interfaces/settings.interface';
import { SettingAdminService } from 'src/setting/roles/admin/admin.service';
import { SmsService } from 'src/sms/sms.service';
import { FindAdvisorShareDto, GenerateAdvisorShareDto } from './dto/advisor-share.dto';
import { FindAllPropertyUserDto, PropertySearchSuggestionUserDto } from './dto/find-all.dto';
import { ONE_HOUR_TTL, ONE_MINUTE_TTL } from 'src/common/utils/constants/cache-ttl.constant';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';

@Injectable()
export class PropertyUserService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly db: PrismaService,
    private readonly propertySerializer: PropertySerializer,
    private readonly dayHelper: DayHelper,
    private readonly config: ConfigService,
    private readonly smsService: SmsService,
    private readonly setting: SettingAdminService,
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
      ownership,
      neighborhood,
      guest_type,
      party,
      pool_type,
      pet,
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
    if (!isEmpty(regions)) query = { ...query, region_id: { in: parseQueryNumberArray(regions) } };

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
    if (ownership) options.push(...parseQueryNumberArray(ownership));
    if (!isEmpty(entertainment)) options.push(...parseQueryNumberArray(entertainment));

    /* --------------------------- نوع های استخر و مهمانی - OR --------------------------- */
    if (party) optionsOR.push(...parseQueryNumberArray(party));
    if (pool_type) optionsOR.push(...parseQueryNumberArray(pool_type));
    if (pet) optionsOR.push(...parseQueryNumberArray(pet));

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
          region: { select: { title: true } },
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
  async findOne(propertySlug: string, isAdvisor: boolean): Promise<PropertyResType & { owner_info: any }> {
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
        region: { select: { title: true } },
        property_options: {
          where: { option: { deleted_at: null } },
          select: { option: { select: { title: true, group: true } } },
        },
        bedrooms: true,
        daily_price: true,
        calendar: { where: calendarDateQuery, orderBy: { date: 'asc' } },
        description: true,
        favorites: true,
        assistants: true,
        owner: { select: { user: { select: { profile_image: true } } } },
      },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    const today = await this.dayHelper.today();
    const serialized = await this.propertySerializer.toJSON(item, today, isAdvisor);

    const ownerInfo = {
      avatar: item.owner.user.profile_image,
      full_name: orderBy(item.assistants, 'is_owner', 'desc')?.[0]?.assistant_full_name,
    };

    return { ...serialized, owner_info: ownerInfo };
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

  /**
   * اطلاعات تماس ملک را برمی‌گرداند (در صورت منقضی بودن اشتراک، شماره مالک با جایاب جایگزین می‌شود)
   */
  async findContactInfo(
    propertySlug: string,
  ): Promise<{ owner: any; list: Partial<PropertyOwnerAssistant>[] }> {
    const code = this.checkSlug(propertySlug);
    const CACHE_KEY = `contact:${code}`;

    const redisValue = await this.redis.get(CACHE_KEY);

    if (redisValue) return JSON.parse(redisValue) as { owner: any; list: Partial<PropertyOwnerAssistant>[] };

    const property = await this.db.property.findUnique({
      where: { code },
      select: {
        id: true,
        subscription_expired_at: true,
        owner: {
          select: { user: { select: { full_name: true, profile_image: true, mobile_number: true } } },
        },
      },
    });
    if (!property) throw new NotFoundException('NOT_FOUND');

    //
    /**
     * اگر اشتراک ملک منقضی شده باشد اطلاعات جایاب نشان داده می‌شود
     * این مورد در توسعه اسفند ۴۰۴ بابن اضافه شدن رزرو برداشته شد
     */
    // if (property.subscription_expired_at < startOfToday()) {
    //   const jayabMobileNumber = await this.setting.get(SettingKey.JAYAB_MOBILE_NUMBER);

    //   //باید با خروجی اخر یکی باشد
    //   return {
    //     owner: {
    //       selfie_image: property.owner?.user?.profile_image,
    //       mobile: property.owner?.user?.mobile_number,
    //     },
    //     list: [
    //       {
    //         assistant_full_name: property.owner?.user?.full_name,
    //         assistant_mobile_number: jayabMobileNumber,
    //         property_id: property.id,
    //         is_owner: true,
    //       },
    //     ],
    //     isPropertyExpired: true,
    //   };
    // }

    const list = await this.db.propertyOwnerAssistant.findMany({
      // where: { property: { ...this.validProperty(), code } },// درتوسعه دی ماه ۴۰۴ قرار شد آگهی های منقضی هم نمایش داده بشه
      where: { property: { code } },
      select: {
        assistant_full_name: true,
        assistant_mobile_number: true,
        is_owner: true,
        property_id: true,
      },
      orderBy: { is_owner: 'desc' },
    });

    const result = {
      owner: {
        selfie_image: property.owner?.user?.profile_image,
        mobile: property.owner?.user?.mobile_number,
      },
      list,
    };

    //set cache
    await this.redis.set(CACHE_KEY, JSON.stringify(result), 'EX', 60 * 60); //one hour

    return result;
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
      /* ---------------------------- first check limit --------------------------- */
      /**
       * مثلا: کاربر اگر در ۱۲۰ دقیقه گذشته روی ۱۰ شماره کلیک کند ۲ روز بلاک میشود
       * اگر بلاک شد یک ستون روی کاربر داریم که تاریخ بلاک موندن رو میندازیم
       * هر دفعه چک میکنیم اگر تاریخ نداشت که دفعه اوله و مستقیم بلاک میشه
       * اگر تاریخ داشت تاریخ رو مقایسه میکنم
       */
      const callClickLimit = +(await this.setting.get(SettingKey.CALL_CLICK_LIMIT));
      const callClickCheckingDuration = +(await this.setting.get(SettingKey.CALL_CLICK_CHECKING_DURATION));
      const callClickBanTtl = +(await this.setting.get(SettingKey.CALL_CLICK_BAN_TTL));

      const clickCount = await this.db.callLog.count({
        where: {
          user_id: userId,
          created_at: {
            gte: moment().subtract(callClickCheckingDuration, 'minutes').utc().startOf('day').toDate(),
          },
        },
      });

      if (clickCount >= callClickLimit) {
        const userBanUntil = user.contact_click_limit_exceeded_at;
        if (userBanUntil) {
          const diff = moment().diff(userBanUntil, 'minutes');
          if (diff < 0) throw new ForbiddenException('CALL_LOG1');
          else
            await this.db.user.update({
              where: { id: user.id },
              data: { contact_click_limit_exceeded_at: null },
            });
        } else {
          await this.db.user.update({
            where: { id: user.id },
            data: { contact_click_limit_exceeded_at: moment().add(callClickBanTtl, 'day').toDate() },
          });
          throw new ForbiddenException('CALL_LOG2');
        }
      }

      /* ---------------------- if limit not exceed continue ---------------------- */
      await this.db.callLog.create({
        data: { property_id: propertyId, user_id: userId, attempts: 1 },
      });

      if (user?.mobile_number !== ownerMobile) {
        this.smsService.sendCallLogToOwner(ownerMobile, user.mobile_number);
      }
    }
  }

  /**
   * valid property constant query
   * در توسعه تاریخ ۹ دی ماه ۱۴۰۴، قرار شده که همه آگهی های منقضی شده نمایش داده بشن
   * @returns
   */
  validProperty() {
    return {
      status: PropertyStatuses.PUBLISHED,
      // subscription_expired_at: { gte: startOfToday() },
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
    // const redisKey = userPropertyViewKey(propertyId, fingerprint);
    // const userViewedPost = await this.redis.get(redisKey);
    // if (userViewedPost) return;
    // await this.redis.set(redisKey, 1, 'EX', 86400);

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

  /* -------------------------------------------------------------------------- */
  /*                                   SEARCH                                   */
  /* -------------------------------------------------------------------------- */
  async searchSuggestions(dto: PropertySearchSuggestionUserDto): Promise<any> {
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

  async searchSuggestionsV2(
    dto: PropertySearchSuggestionUserDto,
  ): Promise<{ cities: any[]; landings: any[] }> {
    const q = dto.q;
    const words = sanitizeText(q);
    if (isEmpty(words)) return { cities: [], landings: [] };

    /* ---------------------------------- city ---------------------------------- */

    const cities = await this.db.$queryRawUnsafe<any[]>(this.cityQueryBuilder(words, 8));

    const landings = await this.db.landingPage.findMany({
      where: {
        OR: this.preprocessSearchTerms(dto.q, 'title') as Prisma.LandingPageWhereInput[],
      },
      select: { id: true, title: true, url: true },
      take: 5,
    });

    return {
      cities,
      landings,
    };
  }

  async search(dto: PropertySearchSuggestionUserDto): Promise<any> {
    let words = sanitizeText(dto.q);
    console.log({ words });

    let clientQuery = {};
    //pool
    if (dto.q.includes('استخر')) {
      clientQuery['has_pool'] = true;
    }

    const exactCity = await this.db.city.findFirst({ where: { title: dto.q } });
    if (exactCity) {
      clientQuery['cities'] = `${exactCity.id}`;
      words = [];
    } else {
      const cities = await this.db.city.findMany({
        where: { title: { in: words } },
        select: { id: true, title: true, parent_id: true, parent: { select: { parent_id: true } } },
      });
      for (const city of cities) {
        if (city.parent?.parent_id) clientQuery['regions'] = (clientQuery['regions'] || '') + `${city.id},`;
        else if (city.parent_id) clientQuery['cities'] = (clientQuery['cities'] || '') + `${city.id},`;
        else clientQuery = { ...clientQuery, province_id: city.id };
      }
      console.log(cities);
    }

    //property type
    const propertyTypes = await this.db.propertyOption.findMany({
      where: { OR: words.map((e) => ({ title: { contains: e } })), group: PropertyOptionGroup.PROPERTY_TYPE },
    });

    const options = await this.db.propertyOption.findMany({
      where: {
        OR: words.map((e) => ({ title: { equals: e } })),
        group: {
          in: [
            PropertyOptionGroup.ENTERTAINMENT,
            PropertyOptionGroup.PATTERN,
            PropertyOptionGroup.OWNERSHIP,
            PropertyOptionGroup.POOL_TYPE,
          ],
        },
      },
    });

    const groupedOptions = groupBy([...options, ...propertyTypes], 'group');
    for (const key in groupedOptions) {
      clientQuery = { ...clientQuery, [key.toLowerCase()]: groupedOptions[key].map((e) => e.id).join(',') };
    }
    console.log(groupedOptions);
    if (isEmpty(Object.values(clientQuery).filter((e) => e))) clientQuery = { q: dto.q };
    console.log(clientQuery);
  }

  /**
   * روزهای رزرو شده برای بستن روی دکمه رزرو
   * @param propertyId
   * @param months
   * @returns
   */
  async findPropertyReservedDays(propertyId: number, months: number): Promise<any> {
    const duration = months > 3 ? 3 : 1;
    const startDate = moment().startOf('jMonth').toDate();
    const endDate = moment().add(duration, 'jMonth').endOf('jMonth').toDate();

    const reserved = await this.db.propertyCalendar.findMany({
      where: { property_id: propertyId, date: { gt: startDate, lte: endDate } },
    });

    return reserved.map((e) => e.date);
  }

  /* --------------------------------- HELPERS -------------------------------- */

  /**
   * create city raw query for search suggestion
   * @param words
   * @param limit
   * @returns
   */
  cityQueryBuilder(words: string[], limit: number): string {
    const conditions = words.map((term) => `c.title ILIKE '%${term}%'`).join(' OR ');
    const exactMatch = words.join(' ');
    const query = `
        SELECT 
            c.id,
            c.title,
            c.parent_id,
            CASE 
                WHEN c.parent_id IS NULL THEN 'province'
                WHEN p.parent_id IS NULL THEN 'city'
                ELSE 'region'
            END as level,
            COALESCE(p.title, '') as parent_title,
            COALESCE(p.id, null) as parent_id,
            COALESCE(g.title, '') as grandparent_title,
            COALESCE(g.id, null) as grandparent_id
        FROM cities c
        LEFT JOIN cities p ON p.id = c.parent_id
        LEFT JOIN cities g ON g.id = p.parent_id
        WHERE ${conditions} AND c.deleted_at is null AND c.title != 'استخر'
        ORDER BY 
            CASE WHEN c.title = '${exactMatch}' THEN 1 ELSE 2 END,
            CASE 
               WHEN c.parent_id IS NULL THEN 1
               WHEN p.parent_id IS NULL THEN 2
               ELSE 3
            END,
            LENGTH(c.title),
            c.title
        LIMIT ${limit}
    `;
    return query;
  }

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
