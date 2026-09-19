import { PropertyQuoteNightBreakdown, PropertyQuoteResType, PropertyQuoteUserDto } from './dto/quote.dto';
import { FindAllPropertyUserDto, PropertySearchSuggestionUserDto } from './dto/find-all.dto';
import { GoneException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { getEffectiveTodayPrice, isEffectivePriceInRange } from 'src/property/common/effective-price.helper';
import { FindAdvisorShareDto, GenerateAdvisorShareDto } from './dto/advisor-share.dto';
import { Prisma, Property, PropertyOwnerAssistant } from '@prisma/client';
import { SearchCityListItem, SearchExtractResult } from './dto/search-extract-response.dto';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PropertyArrayResType, PropertyJsonType } from 'src/property/serializer/property.serializer';
import { DayColumn, resolveDayColumn, toDayKey } from 'src/common/helpers/day.helper';
import { buildMatchedOrder, buildSearchTokens } from 'src/property/common/helpers/search-query-parser.helper';
import { PropertyResType, PropertySerializer } from 'src/property/serializer/property.serializer';
import { MatchedEntry, ResolvedLocation } from 'src/property/common/helpers/search-query-parser.helper';
import { UnprocessableEntityException } from '@nestjs/common';
import { findCanonicalLocationLanding } from 'src/landing-page/common/canonical-landing.helper';
import { detectPool, resolveLocation } from 'src/property/common/helpers/search-query-parser.helper';
import { matchOptions, residualWords } from 'src/property/common/helpers/search-query-parser.helper';
import { normalizePersianSearchText } from 'src/property/common/helpers/search-text.helper';
import { startOfDate, startOfToday } from 'src/common/helpers/date.helper';
import { paginate, PaginatedResult } from 'src/common/helpers/paginator';
import { applyPropertySearchScope } from 'src/property/common/helpers/property-search-query.helper';
import { buildCitySuggestionQuery } from 'src/property/common/helpers/property-search-query.helper';
import { SEARCHABLE_OPTION_GROUPS } from 'src/property/common/helpers/search-query-parser.helper';
import { parseQueryNumberArray } from 'src/common/helpers/parse-query-array.pipe';
import { persianSearchVariants } from 'src/property/common/helpers/search-text.helper';
import { SearchSuggestionType } from './dto/search-suggestion-response.dto';
import { buildFuzzyCityQuery } from 'src/property/common/helpers/property-search-query.helper';
import { SettingAdminService } from 'src/setting/roles/admin/admin.service';
import { isExactPropertyCode } from 'src/property/common/helpers/search-text.helper';
import { buildLocationSpans } from 'src/property/common/helpers/search-query-parser.helper';
import { tokenizeSearchText } from 'src/property/common/helpers/search-text.helper';
import { CancelingTypeList } from 'src/property/common/types/property-canceling-types.type';
import { resolveNightPrice } from 'src/property/common/night-price.helper';
import { LocationCandidate } from 'src/property/common/helpers/search-query-parser.helper';
import { isEmpty, orderBy } from 'lodash';
import { SearchableOption } from 'src/property/common/helpers/search-query-parser.helper';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { PartialUser } from 'src/common/interfaces/user.interface';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { SettingKey } from 'src/setting/common/interfaces/settings.interface';
import { SmsService } from 'src/sms/sms.service';
import { toAndArray } from 'src/property/common/helpers/property-search-query.helper';
import { DayHelper } from 'src/common/helpers/day.helper';
import { Redis } from 'ioredis';

import randomstring from 'randomstring';
import moment from 'moment-jalaali';

const CITY_SUGGESTION_LIMIT = 5;
const SEARCHABLE_OPTIONS_TTL_MS = 5 * 60 * 1000;
const TITLE_CANDIDATE_LIMIT = 20;
const FUZZY_CITY_SIMILARITY = 0.45;
const FUZZY_MIN_WORD_LENGTH = 3;
const TRIGRAM_RETRY_MS = 10 * 60 * 1000;

@Injectable()
export class PropertyUserService {
  private readonly logger = new Logger(PropertyUserService.name);
  private searchableOptions: { expiresAt: number; options: SearchableOption[] } | null = null;
  private trigramRetryAt = 0;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly db: PrismaService,
    private readonly propertySerializer: PropertySerializer,
    private readonly dayHelper: DayHelper,
    private readonly config: ConfigService,
    private readonly smsService: SmsService,
    private readonly setting: SettingAdminService,
  ) {}

  async findAll(
    dto: FindAllPropertyUserDto,
    isAdvisor: boolean = false,
    propertyIds?: number[],
  ): Promise<PaginatedResult<PropertyArrayResType>> {
    const {
      code,
      provinces,
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
      has_blue_tick,
      is_authorized,
    } = dto;

    const today = await this.dayHelper.today();

    //initial query
    let query: Prisma.PropertyWhereInput = this.validProperty();

    if (code) query = { ...query, code };
    if (is_authorized) query = { ...query, is_authorized: true };
    if (has_blue_tick) query = { ...query, has_blue_tick: true };

    const citiesArray = parseQueryNumberArray(cities);
    const provincesArray = parseQueryNumberArray(provinces);
    const regionsArray = parseQueryNumberArray(regions);

    query = applyPropertySearchScope(query, {
      regions: regionsArray,
      cities: citiesArray,
      provinces: provincesArray,
      q,
    });
    if (total_bedrooms > 0) query = { ...query, bedrooms: { total_bedrooms: total_bedrooms } };
    if (total_guests > 0) query = { ...query, max_capacity: { gte: total_guests } };

    const options = [];
    /* ------------------------------ options query (new) ----------------------------- */
    if (property_type) options.push({ options_array: { hasSome: parseQueryNumberArray(property_type) } });
    if (ownership) options.push({ options_array: { hasSome: parseQueryNumberArray(ownership) } });
    if (guest_type) options.push({ options_array: { hasSome: parseQueryNumberArray(guest_type) } });
    if (pattern) options.push({ options_array: { hasSome: parseQueryNumberArray(pattern) } });
    if (welfare) options.push({ options_array: { hasSome: parseQueryNumberArray(welfare) } });
    if (kitchen) options.push({ options_array: { hasSome: parseQueryNumberArray(kitchen) } });
    if (cool_heat) options.push({ options_array: { hasSome: parseQueryNumberArray(cool_heat) } });
    if (neighborhood) options.push({ options_array: { hasSome: parseQueryNumberArray(neighborhood) } });
    if (entertainment) options.push({ options_array: { hasSome: parseQueryNumberArray(entertainment) } });
    if (party) options.push({ options_array: { hasSome: parseQueryNumberArray(party) } });
    if (pool_type) options.push({ options_array: { hasSome: parseQueryNumberArray(pool_type) } });
    if (pet) options.push({ options_array: { hasSome: parseQueryNumberArray(pet) } });
    if (options?.length > 0)
      query = {
        ...query,
        AND: [...toAndArray(query.AND), ...options],
      };

    /* ------------------------------ فقط استخردار ------------------------------ */
    if (has_pool === 1) query = { ...query, has_pool: true };
    else if (has_pool === 0) query = { ...query, has_pool: false };

    /* -------------------------------- تخفیف دار ------------------------------- */
    if (has_discount === 1)
      query = { ...query, calendar: { some: { date: startOfToday(), discount_percentage: { gt: 0 } } } };

    /* ------------------------------ ملک های ویژه ------------------------------ */
    if (is_premium === 1) query = { ...query, has_blue_tick: true };

    /* ---------------------------------- title --------------------------------- */
    if (title) query = { ...query, title: { contains: title, mode: 'insensitive' } };

    const hasPriceFilter = min_price !== undefined || max_price !== undefined;
    const hasPriceSort = dto.sort_type === 'price_asc' || dto.sort_type === 'price_desc';

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
          { calendar: query.calendar || {} },
          //@ts-ignore
        ].concat(query.AND || []),
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
        orderByQuery = [{ favorite_count: 'desc' }, { id: 'desc' }];
        break;
      case 'newset':
        orderByQuery = [{ sort_order: 'desc' }, { id: 'desc' }];
        break;
      case 'commission_desc':
        orderByQuery = [{ advisor_commission: 'desc' }, { id: 'desc' }];
        break;
      default:
        orderByQuery = [{ sort_order: 'desc' }, { id: 'desc' }];
        break;
    }

    const include = {
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
      _count: { select: { property_images: true } },
    } satisfies Prisma.PropertyInclude;

    let orderedPageIds: number[] = null;
    let priceMeta: PaginatedResult<PropertyArrayResType>['meta'] = null;

    if (hasPriceFilter || hasPriceSort) {
      const candidates = await this.db.property.findMany({
        where: query,
        select: {
          id: true,
          daily_price: true,
          calendar: { where: { date: startOfToday() }, select: { effective_price: true } },
        },
      });
      const pricedCandidates = candidates
        .map((property) => ({ id: property.id, price: getEffectiveTodayPrice(property, today) }))
        .filter(({ price }) => isEffectivePriceInRange(price, min_price, max_price));

      if (hasPriceSort) {
        const direction = dto.sort_type === 'price_asc' ? 1 : -1;
        pricedCandidates.sort((a, b) => direction * (a.price - b.price) || a.id - b.id);
        const page = Number(dto.page) || 1;
        const perPage = Number(dto.per_page) || 10;
        const total = pricedCandidates.length;
        const lastPage = Math.ceil(total / perPage);
        orderedPageIds = pricedCandidates.slice((page - 1) * perPage, page * perPage).map(({ id }) => id);
        priceMeta = {
          total,
          lastPage,
          currentPage: page,
          perPage,
          prev: page > 1 ? page - 1 : null,
          next: page < lastPage ? page + 1 : null,
        };
      } else {
        query = { ...query, id: { in: pricedCandidates.map(({ id }) => id) } };
      }
    }

    if (hasPriceSort) {
      const pageData = await this.db.property.findMany({
        where: { ...query, id: { in: orderedPageIds } },
        include,
      });
      const order = new Map(orderedPageIds.map((id, index) => [id, index]));
      pageData.sort((a, b) => order.get(a.id) - order.get(b.id));
      const serialized = await this.propertySerializer.toArray(pageData, today, isAdvisor, false);
      return { data: serialized, meta: priceMeta };
    }
    const list = await paginate()<PropertyJsonType, Prisma.PropertyFindManyArgs>(
      this.db.property,
      {
        where: query,
        include,
        orderBy: orderByQuery,
      },
      { page: dto.page, perPage: dto.per_page },
    );
    const serialized = await this.propertySerializer.toArray(list.data, today, isAdvisor, false);
    return { data: serialized, meta: list.meta };
  }

  async findOne(propertySlug: string, isAdvisor: boolean): Promise<PropertyResType & { owner_info: any }> {
    const code = this.checkSlug(propertySlug);
    const calendarDateQuery: Prisma.PropertyCalendarWhereInput = {
      date: { gte: startOfToday(), lt: startOfDate(moment().add(8, 'days').toDate()) },
    };

    const item = await this.db.property.findFirst({
      where: { code, deleted_at: new Date() },
      include: {
        feature_image: true,
        property_images: { include: { attachment: true }, orderBy: { sort_order: 'asc' } },
        province: { select: { title: true } },
        city: { select: { title: true } },
        region: { select: { title: true } },
        property_options: {
          where: { option: { deleted_at: null } },
          select: { option: { select: { title: true, group: true, image: true } } },
        },
        bedrooms: true,
        daily_price: true,
        calendar: { where: calendarDateQuery, orderBy: { date: 'asc' } },
        description: true,
        assistants: { select: { assistant_full_name: true, is_owner: true } },
        owner: { select: { user: { select: { profile_image: true } } } },
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');
    if (!!item.deleted_at) throw new GoneException('GONE');
    if (item.status !== PropertyStatuses.PUBLISHED) throw new NotFoundException('NOT_FOUND');
    const today = await this.dayHelper.today();
    const serialized = await this.propertySerializer.toJSON(item, today, isAdvisor);
    const ownerInfo = {
      avatar: item.owner.user.profile_image,
      full_name: orderBy(item.assistants, 'is_owner', 'desc')?.[0]?.assistant_full_name,
    };
    return { ...serialized, owner_info: ownerInfo };
  }

  async findById(id: number): Promise<Property> {
    const item = await this.db.property.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');
    return item;
  }

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
    const list = await this.db.propertyOwnerAssistant.findMany({
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
    await this.redis.set(CACHE_KEY, JSON.stringify(result), 'EX', 60 * 60);
    return result;
  }

  async storeCallLog(propertyId: number, user: PartialUser, ownerMobile: string): Promise<void> {
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
      await this.db.callLog.create({
        data: { property_id: propertyId, user_id: userId, attempts: 1 },
      });
      if (user?.mobile_number !== ownerMobile)
        this.smsService.sendCallLogToOwner(ownerMobile, user.mobile_number);
    }
  }

  validProperty() {
    return {
      status: PropertyStatuses.PUBLISHED,
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

  async updateViewStatistics(propertyId: number, count: number, type: 'impression' | 'view'): Promise<void> {
    const now = startOfToday();
    await this.db.propertyStatistics.upsert({
      where: { property_id_date: { property_id: propertyId, date: now } },
      update: {
        view_count: { increment: type === 'view' ? count || 1 : 0 },
        impression_count: { increment: type === 'impression' ? count || 1 : 0 },
      },
      create: {
        date: now,
        property_id: propertyId,
        view_count: type === 'view' ? 1 : 0,
        impression_count: type === 'impression' ? 1 : 0,
      },
    });
  }

  async generateAdvisorShare(
    propertyId: number,
    advisorId: number,
    dto: GenerateAdvisorShareDto,
  ): Promise<string> {
    const advisorShareUrl = this.config.get('url.advisorShareUrl');
    const key = randomstring.generate({ length: 10, charset: 'alphanumeric' });
    await this.db.advisorShare.create({
      data: { key, property_id: propertyId, advisor_id: advisorId, elements: dto.elements },
    });
    const url = `${advisorShareUrl}/s?content=${key}`;
    return url;
  }

  async findAdvisorShareData(dto: FindAdvisorShareDto): Promise<any> {
    const data = await this.db.advisorShare.findUnique({ where: { key: dto.content } });
    if (!data) throw new BadRequestException();
    const prop = await this.db.property.findUnique({
      where: { id: data.property_id },
      select: { slug: true, feature_image: true },
    });
    const property = await this.findOne(prop.slug, false);
    const advisor = await this.db.advisor.findUnique({
      where: { id: data.advisor_id },
      select: { user: { select: { full_name: true, mobile_number: true, profile_image: true } } },
    });
    return { property, advisor, elements: data.elements?.split(',') };
  }

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
        is_active: true,
        main_content_id: { not: null },
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
  ): Promise<{ cities: any[]; landings: any[]; properties: any[]; items: any[] }> {
    const q = normalizePersianSearchText(dto.q);
    if (isExactPropertyCode(q)) {
      const exactProperty = await this.db.property.findFirst({
        where: { code: q, status: PropertyStatuses.PUBLISHED },
        select: { id: true, title: true, slug: true, code: true },
      });
      return {
        cities: [],
        landings: [],
        properties: !!exactProperty ? [exactProperty] : [],
        items: exactProperty
          ? [
              {
                type: SearchSuggestionType.PROPERTY,
                id: exactProperty.id,
                label: exactProperty.title ?? '',
                target: `/rooms/${exactProperty.slug}`,
              },
            ]
          : [],
      };
    }
    const words = tokenizeSearchText(q);
    if (isEmpty(words)) return { cities: [], landings: [], properties: [], items: [] };

    const cityMatches = await this.db.$queryRaw<any[]>(this.cityQueryBuilder(words, CITY_SUGGESTION_LIMIT));
    const cities = await Promise.all(
      cityMatches.map(async (city) => {
        const url = await findCanonicalLocationLanding(this.db, {
          cityId:
            city.level === SearchSuggestionType.REGION
              ? Number(city.parent_id)
              : city.level === SearchSuggestionType.CITY
                ? Number(city.id)
                : undefined,
          provinceId: city.level === SearchSuggestionType.PROVINCE ? Number(city.id) : undefined,
        });
        return { ...city, target: url ? `/${url}` : undefined };
      }),
    );

    const [landings, properties] = await Promise.all([
      this.db.landingPage.findMany({
        where: {
          is_active: true,
          main_content_id: { not: null },
          AND: words.map((word) => ({
            OR: persianSearchVariants(word).map((variant) => ({
              title: { contains: variant, mode: 'insensitive' as const },
            })),
          })),
        },
        select: { id: true, title: true, url: true },
        orderBy: [{ title: 'asc' }, { id: 'asc' }],
        take: 5,
      }),
      this.db.property.findMany({
        where: {
          ...this.validProperty(),
          AND: words.map((word) => ({
            OR: persianSearchVariants(word).map((variant) => ({
              title: { contains: variant, mode: 'insensitive' as const },
            })),
          })),
        },
        select: { id: true, title: true, slug: true, code: true },
        orderBy: [{ title: 'asc' }, { id: 'asc' }],
        take: 5,
      }),
    ]);

    return {
      cities,
      landings,
      properties,
      items: [
        ...properties.map((property) => ({
          type: SearchSuggestionType.PROPERTY,
          id: property.id,
          label: property.title ?? '',
          target: `/rooms/${property.slug}`,
        })),
        ...cities.map((city) => ({
          type: city.level as SearchSuggestionType,
          id: city.id,
          label: city.title,
          parentLabel: city.parent_title || undefined,
          target:
            city.target ||
            (city.level === SearchSuggestionType.PROVINCE
              ? `/rooms?provinces=${city.id}`
              : city.level === SearchSuggestionType.REGION
                ? `/rooms?cities=${city.parent_id}&regions=${city.id}`
                : `/rooms?cities=${city.id}`),
        })),
        ...landings.map((landing) => ({
          type: SearchSuggestionType.LANDING,
          id: landing.id,
          label: landing.title,
          target: `/${landing.url}`,
        })),
      ],
    };
  }

  async search(dto: PropertySearchSuggestionUserDto): Promise<SearchExtractResult> {
    const startedAt = Date.now();
    const query = normalizePersianSearchText(dto.q);
    const result = await this.extractSearchFilters(query);
    this.logger.debug(
      `search/extract q="${query}" filters=${JSON.stringify(result.client_query)} ` +
        `order=${result.matched_order.join(',')} ignored=${result.ignored_terms.join(',')} ` +
        `${Date.now() - startedAt}ms`,
    );
    return result;
  }

  private async extractSearchFilters(query: string): Promise<SearchExtractResult> {
    if (isExactPropertyCode(query)) {
      const property = await this.db.property.findFirst({
        where: { code: query, ...this.validProperty() },
        select: { id: true, title: true, slug: true, code: true },
      });
      return {
        client_query: { code: query },
        cities_list: [],
        landing_url: null,
        matched_order: ['code'],
        property,
        ignored_terms: [],
      };
    }

    const tokens = buildSearchTokens(query);
    const consumed = new Set<number>();
    const order: MatchedEntry[] = [];
    const clientQuery: Record<string, string | number> = {};
    const consume = (positions: number[]): void => positions.forEach((position) => consumed.add(position));

    const applyLocation = (location: ResolvedLocation): void => {
      clientQuery[location.key] = location.ids.join(',');
      if (location.parentCityId) clientQuery.cities = `${location.parentCityId}`;
      consume(location.consumed);
      order.push(...location.order);
    };

    const location = resolveLocation(await this.findLocationCandidates(buildLocationSpans(tokens)));
    if (location) applyLocation(location);

    const pool = detectPool(tokens);
    if (pool) {
      clientQuery.has_pool = pool.value;
      consume(pool.consumed);
      order.push({ key: 'has_pool', position: pool.position });
    }

    const optionMatches = matchOptions(tokens, consumed, await this.getSearchableOptions());
    for (const match of optionMatches) {
      clientQuery[match.key] = match.ids.join(',');
      consume(match.positions);
      order.push({ key: match.key, position: match.positions[0] });
    }

    let residual = residualWords(tokens, consumed);
    const ignoredTerms: string[] = [];

    if (residual.length > 0) {
      const titleMatches = await this.findTitleCandidates(
        residual.map(({ word }) => word),
        clientQuery,
      );

      if (titleMatches.length > 0) {
        for (const match of optionMatches) {
          const ids = new Set(match.ids);
          const isSatisfied = titleMatches.some((property) =>
            property.options_array.some((id) => ids.has(id)),
          );
          const isPartOfTitle =
            match.words.length > 0 &&
            titleMatches.some((property) => {
              const titleWords = new Set(tokenizeSearchText(property.title ?? ''));
              return match.words.every((word) => titleWords.has(word));
            });
          if (isSatisfied || !isPartOfTitle) continue;

          delete clientQuery[match.key];
          const index = order.findIndex((entry) => entry.key === match.key);
          if (index >= 0) order.splice(index, 1);
          match.positions.forEach((position) => consumed.delete(position));
        }
        residual = residualWords(tokens, consumed);
      } else {
        if (!location) {
          const fuzzy = await this.findFuzzyLocation(residual);
          if (fuzzy) {
            applyLocation(fuzzy);
            residual = residual.filter(({ position }) => !consumed.has(position));
          }
        }
        if (residual.length > 0 && !isEmpty(clientQuery)) {
          ignoredTerms.push(...residual.map(({ word }) => word));
          residual = [];
        }
      }
    }

    if (residual.length > 0) {
      clientQuery.q = residual.map(({ word }) => word).join(' ');
      order.push({ key: 'q', position: residual[0].position });
    }

    const citiesList = await this.buildSearchCitiesList(clientQuery);
    const landingUrl =
      citiesList.length === 1 && !clientQuery.q && !clientQuery.regions
        ? await findCanonicalLocationLanding(this.db, {
            cityId: citiesList[0].level === 'city' ? Number(citiesList[0].id) : undefined,
            provinceId: citiesList[0].level === 'province' ? Number(citiesList[0].id) : undefined,
          })
        : null;

    return {
      client_query: clientQuery,
      cities_list: citiesList,
      landing_url: landingUrl ?? null,
      matched_order: buildMatchedOrder(order),
      property: null,
      ignored_terms: ignoredTerms,
    };
  }

  private async findLocationCandidates(
    spans: { text: string; start: number; end: number }[],
  ): Promise<LocationCandidate[]> {
    if (spans.length === 0) return [];
    const titles = [...new Set(spans.flatMap((span) => persianSearchVariants(span.text)))];
    const rows = await this.db.city.findMany({
      where: { deleted_at: null, title: { in: titles, notIn: ['استخر'] } },
      select: { id: true, title: true, parent_id: true, parent: { select: { parent_id: true } } },
    });

    return spans.flatMap((span) =>
      rows
        .filter((row) => normalizePersianSearchText(row.title) === span.text)
        .map((row) => ({
          id: row.id,
          title: row.title,
          parent_id: row.parent_id,
          grandparent_id: row.parent?.parent_id ?? null,
          start: span.start,
          end: span.end,
        })),
    );
  }

  private async findFuzzyLocation(
    residual: { word: string; position: number }[],
  ): Promise<ResolvedLocation | null> {
    const terms = residual.filter(
      ({ word }) => word.length >= FUZZY_MIN_WORD_LENGTH && !isExactPropertyCode(word),
    );
    if (terms.length === 0 || Date.now() < this.trigramRetryAt) return null;

    try {
      const rows = await this.db.$queryRaw<
        { term: string; id: number; title: string; parent_id: number | null; grandparent_id: number | null }[]
      >(buildFuzzyCityQuery([...new Set(terms.map(({ word }) => word))], FUZZY_CITY_SIMILARITY));
      return resolveLocation(
        rows.flatMap((row) =>
          terms
            .filter(({ word }) => word === row.term)
            .map(({ position }) => ({
              id: Number(row.id),
              title: row.title,
              parent_id: row.parent_id === null ? null : Number(row.parent_id),
              grandparent_id: row.grandparent_id === null ? null : Number(row.grandparent_id),
              start: position,
              end: position,
            })),
        ),
      );
    } catch (error) {
      this.trigramRetryAt = Date.now() + TRIGRAM_RETRY_MS;
      this.logger.warn(`Fuzzy city search unavailable: ${(error as Error)?.message}`);
      return null;
    }
  }

  private findTitleCandidates(
    words: string[],
    clientQuery: Record<string, string | number>,
  ): Promise<{ id: number; title: string | null; options_array: number[] }[]> {
    const where = applyPropertySearchScope(this.validProperty(), {
      regions: parseQueryNumberArray(String(clientQuery.regions ?? '')),
      cities: parseQueryNumberArray(String(clientQuery.cities ?? '')),
      provinces: parseQueryNumberArray(String(clientQuery.provinces ?? '')),
      q: words.join(' '),
    });
    return this.db.property.findMany({
      where,
      select: { id: true, title: true, options_array: true },
      take: TITLE_CANDIDATE_LIMIT,
    });
  }

  private async getSearchableOptions(): Promise<SearchableOption[]> {
    if (this.searchableOptions && this.searchableOptions.expiresAt > Date.now())
      return this.searchableOptions.options;

    const options = await this.db.propertyOption.findMany({
      where: { deleted_at: null, group: { in: [...SEARCHABLE_OPTION_GROUPS] } },
      select: { id: true, title: true, group: true },
    });
    this.searchableOptions = { expiresAt: Date.now() + SEARCHABLE_OPTIONS_TTL_MS, options };
    return options;
  }

  private async buildSearchCitiesList(
    clientQuery: Record<string, string | number>,
  ): Promise<SearchCityListItem[]> {
    const ids = [
      ...parseQueryNumberArray(String(clientQuery.provinces || '')),
      ...parseQueryNumberArray(String(clientQuery.cities || '')),
      ...parseQueryNumberArray(String(clientQuery.regions || '')),
    ];
    if (ids.length === 0) return [];

    const records = await this.db.city.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        title: true,
        parent_id: true,
        parent: { select: { id: true, title: true, parent: { select: { id: true, title: true } } } },
      },
    });

    return records.map((city) => ({
      id: city.id,
      title: city.title,
      parent_id: city.parent_id,
      level: city.parent?.parent ? 'region' : city.parent_id ? 'city' : 'province',
      parent_title: city.parent?.title,
      grandparent_title: city.parent?.parent?.title,
      grandparent_id: city.parent?.parent?.id,
    }));
  }

  async findPropertyReservedDays(propertyId: number, months: number): Promise<any> {
    const duration = Math.min(Math.max(months || 1, 1), 12);
    const startDate = startOfToday();
    const endDate = moment().add(duration, 'jMonth').endOf('jMonth').toDate();
    const reserved = await this.db.propertyCalendar.findMany({
      where: { property_id: propertyId, is_reserved: true, date: { gte: startDate, lte: endDate } },
      select: { date: true },
    });
    return reserved.map((e) => e.date);
  }

  async quote(propertyId: number, dto: PropertyQuoteUserDto): Promise<PropertyQuoteResType> {
    const nights = moment(dto.check_out).diff(dto.check_in, 'd');
    if (nights === 0) throw new UnprocessableEntityException('RESERVE1');
    if (nights < 0) throw new UnprocessableEntityException('RESERVE2');
    if (moment().diff(dto.check_in, 'day') > 0) throw new UnprocessableEntityException('RESERVE3');
    if (nights > 15) throw new UnprocessableEntityException('QUOTE_MAX_NIGHTS');

    const [property, calendar, peaks] = await Promise.all([
      this.db.property.findFirst({
        where: { id: propertyId, ...this.validProperty() },
        select: { id: true, std_capacity: true, max_capacity: true, canceling_type: true, daily_price: true },
      }),
      this.db.propertyCalendar.findMany({
        where: { property_id: propertyId, date: { gte: dto.check_in, lt: dto.check_out } },
        select: { date: true, price: true, discounted_price: true, is_reserved: true },
      }),
      this.db.peakDay.findMany({
        where: { date: { gte: dto.check_in, lt: dto.check_out } },
        select: { date: true },
      }),
    ]);
    if (!property) throw new NotFoundException('NOT_FOUND');

    const peakDayKeys = new Set(peaks.map((e) => toDayKey(e.date)));
    const calendarByDate = new Map(calendar.map((e) => [toDayKey(e.date), e]));

    const nightsBreakdown: PropertyQuoteNightBreakdown[] = [];
    const unavailableDates: string[] = [];
    let rentTotal = 0;
    let discountTotal = 0;
    for (let i = 0; i < nights; i++) {
      const date = moment(dto.check_in).add(i, 'day').toDate();
      const dayKey = toDayKey(date);
      const calendarEntry = calendarByDate.get(dayKey);
      const column = resolveDayColumn(date, peakDayKeys);
      const { base, final, discounted } = resolveNightPrice(calendarEntry, property.daily_price, column);

      if (calendarEntry?.is_reserved) unavailableDates.push(dayKey);
      rentTotal += final;
      discountTotal += base - final;
      nightsBreakdown.push({
        date: dayKey,
        day_column: column,
        base_price: base,
        final_price: final,
        is_discounted: discounted,
        is_peak: column === DayColumn.peak,
      });
    }

    const extraGuests = Math.max(0, dto.guests - (property.std_capacity ?? 0));
    const extraGuestFeePerNight = property.daily_price?.additional_person ?? 0;
    const extraGuestTotal = extraGuests * extraGuestFeePerNight * nights;
    const cleaningFee = property.daily_price?.cleaning ?? 0;
    const cancelingType = CancelingTypeList.find((e) => e.id === property.canceling_type);

    return {
      property_id: property.id,
      check_in: toDayKey(dto.check_in),
      check_out: toDayKey(dto.check_out),
      nights,
      guests: dto.guests,
      is_available: unavailableDates.length === 0,
      unavailable_dates: unavailableDates,
      nights_breakdown: nightsBreakdown,
      rent_total: rentTotal,
      discount_total: discountTotal,
      std_capacity: property.std_capacity ?? 0,
      max_capacity: property.max_capacity ?? 0,
      extra_guests: extraGuests,
      extra_guest_fee_per_night: extraGuestFeePerNight,
      extra_guest_total: extraGuestTotal,
      cleaning_fee: cleaningFee,
      total: rentTotal + extraGuestTotal + cleaningFee,
      canceling_type: cancelingType ? { id: `${cancelingType.id}`, title: cancelingType.title } : null,
    };
  }

  cityQueryBuilder(words: string[], limit: number): Prisma.Sql {
    return buildCitySuggestionQuery(words, limit);
  }

  preprocessSearchTerms = (searchTerm: string, column: string): string[] => {
    const specialChars = /[()|&:*!]/g;
    const strings = searchTerm.trim().replace(specialChars, ' ').split(/\s+/);
    const query = [];
    for (const text of strings) {
      query.push({ [column]: { contains: text } });
    }
    return query;
  };

  async duplicate(_propertyId: number): Promise<void> {
    return;
  }
}
