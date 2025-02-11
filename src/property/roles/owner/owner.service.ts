import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Property, Prisma, SubscriptionPlan, PropertyStatistics } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { InProgressReserveStatus, PropertyStatuses } from 'src/property/common/types/property-status.type';
import { OptionConnect } from 'src/common/interfaces/option-connect.interface';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';
import { random } from 'lodash';
import { UpdatePropertyAdvisorCommissionOwnerDto } from './dto/update.dto';
import {
  UpdatePropertyBedroomOwnerDto,
  UpdatePropertyEnvOwnerDto,
  UpdatePropertyFacilityOwnerDto,
  UpdatePropertyLocationOwnerDto,
  UpdatePropertyMediaOwnerDto,
  UpdatePropertyOwnerAssistantOwnerDto,
  UpdatePropertyPriceOwnerDto,
  UpdatePropertyStepOneOwnerDto,
  UpdatePropertyTermsOwnerDto,
} from './dto/update-property.dto';
import { PropertyInterceptorData } from 'src/property/common/interceptors/owner-property.interceptor';
import { PartialUser } from 'src/common/interfaces/user.interface';
import { PaySubscriptionPropertyOwnerDto } from './dto/pay-subscription.dto';
import moment from 'moment-jalaali';
import { SubscriptionPlanUserService } from 'src/subscription-plan/roles/user/user.service';
import { PaymentUserService } from 'src/payment/roles/user/user.service';
import { slugify } from 'src/common/helpers/slugify';
import {
  PropertyArrayResType,
  PropertyResType,
  PropertySerializer,
} from 'src/property/serializer/property.serializer';
import { DayColumn, DayHelper } from 'src/common/helpers/day.helper';
import { convertJalaaliDtoToDate, startOfDate, startOfToday } from 'src/common/helpers/date.helper';
import { TurnoverType } from 'src/payment/common/turnover-type.enum';
import { SubscriptionStatus } from 'src/subscription/common/subscription-status.type';

@Injectable()
export class PropertyOwnerService {
  constructor(
    private readonly db: PrismaService,
    private readonly subscriptionPlanUserService: SubscriptionPlanUserService,
    private readonly paymentUserService: PaymentUserService,
    private readonly propertySerializer: PropertySerializer,
    private readonly dayHelper: DayHelper,
  ) {}

  /**
   * Create a property with init status
   * If exist return this
   * @param ownerId
   * @returns
   */
  async findLastInitProp(ownerId: number, propertyId?: number): Promise<Property> {
    // const activeSubscription = await this.subscriptionService.findPlanByRole(user);
    // if (!activeSubscription) throw new NotAcceptableException('OWNER_SUB1');

    let query: Prisma.PropertyWhereInput = { owner_id: ownerId };
    if (propertyId) query = { ...query, id: propertyId };
    else query = { ...query, status: { in: InProgressReserveStatus } };

    const include: Prisma.PropertyInclude = {
      province: { select: { title: true } },
      city: { select: { title: true } },
      region: { select: { title: true } },
      feature_image: { select: { name: true, thumbnail: true } },
      daily_price: true,
      description: true,
      property_options: { include: { option: true } },
      attachments: { where: { type: 1 } },
      assistants: {
        select: { assistant_full_name: true, assistant_mobile_number: true, is_owner: true },
      },
      bedrooms: true,
      // property_authorize: true,
      // propertyReservedDays: { where: { timestamp: this.dayHelper.todayUnix() } },
      // propertyReservedDays: { where: { AND: [{ timestamp: { gte: from } }, { timestamp: { lt: to } }] } },
    };

    /* -------------------------------------------------------------------------- */
    // check the init property, if exist return this
    const initProp = await this.db.property.findFirst({ where: query, include });
    if (propertyId && !initProp) throw new NotFoundException('PROPERTY_NOT_FOUND');
    if (initProp) return initProp;

    /* -------------------------------------------------------------------------- */
    // property statistics
    // const propertyStatistics: PropertyStatisticType = {
    //   approved_rent: 0,
    //   approved_direct_rent: 0,
    //   approved_agreement: 0,
    //   approved_direct_agreement: 0,
    // };

    /* -------------------------------------------------------------------------- */
    // generate a random unique code
    let code: string;
    do {
      code = `${random(10_000, 99_999).toString()}`;
    } while (await this.db.property.findUnique({ where: { code } }));

    /* -------------------------------------------------------------------------- */
    // create new property
    const newProp = await this.db.property.create({
      data: { owner_id: ownerId, status: PropertyStatuses.INIT, code, sort_order: Date.now() },
      include,
      // data: { owner_id: user.owner_id, status: PropertyStatuses.INIT, statistics: propertyStatistics },
    });

    return newProp;
  }

  /**
   * update init
   * @param property
   * @param dto
   * @returns
   */
  async updateInit(property: Property, dto: UpdatePropertyStepOneOwnerDto): Promise<void> {
    const slug = `${property.code}-${slugify(dto.title)}`;
    // const { options: o, numericIds: m } = await this.deleteAndCreateNewOption(property.id, dto, [
    //   PropertyOptionGroup.PROPERTY_TYPE,
    //   PropertyOptionGroup.OWNERSHIP,
    //   PropertyOptionGroup.BUILDING_DIRECTION,
    // ]);
    // throw new BadRequestException();

    /* -------------------------------------------------------------------------- */
    // data without options
    let data: Prisma.PropertyUncheckedUpdateInput = {
      province_id: dto.province_id,
      region_id: dto.region_id || null,
      city_id: dto.city_id,
      title: dto.title,
      slug,
      land_area: dto.land_area,
      building_area: dto.building_area,
      floors: dto.floors,
      floor: dto.floor,
      unit_per_floor: dto.unit_per_floor,
      construction_year: dto.construction_year,
      address: dto.address,
      is_chat_enabled: dto.is_chat_enabled,
      is_location_visible: dto.is_location_visible,
    };

    // do not update status in edit
    if (property.status === PropertyStatuses.INIT) data = { ...data, status: PropertyStatuses.IN_PROCESS };

    /* -------------------------------------------------------------------------- */
    // create options relations - delete old options
    const { options, numericIds } = await this.deleteAndCreateNewOption(property.id, dto, [
      PropertyOptionGroup.PROPERTY_TYPE,
      PropertyOptionGroup.OWNERSHIP,
      PropertyOptionGroup.BUILDING_DIRECTION,
    ]);

    /* -------------------------------------------------------------------------- */
    await this.db.property.update({
      where: { id: property.id },
      data: { ...data, property_options: { create: options }, options_array: { set: numericIds } },
    });

    // return prop;
  }

  /**
   * Update location
   * @param propertyId
   * @param dto
   * @returns
   */
  async updateLocation(propertyId: number, dto: UpdatePropertyLocationOwnerDto): Promise<void> {
    const prop = await this.db.property.update({
      where: { id: propertyId },
      data: { lat: Number(dto.lat.toFixed(6)), lng: Number(dto.lng.toFixed(6)) },
    });

    // return { lat: prop.lat, lng: prop.lng };
  }

  /**
   * Update images and video
   * @param user
   * @param propertyId
   * @param dto
   * @returns
   */
  async updateMedia(propertyId: number, dto: UpdatePropertyMediaOwnerDto): Promise<void> {
    let attachments = [];
    dto.images.map((e) => attachments.push({ id: e }));

    // delete all attachments
    await this.db.property.update({ where: { id: propertyId }, data: { attachments: { set: [] } } });

    const updatedProperty = await this.db.property.update({
      where: { id: propertyId },
      data: {
        attachments: { connect: attachments },
        feature_image_id: dto.feature_image_id,
        // video_id: dto.video_id || null,
      },
    });

    // return updatedProperty;
  }

  /**
   * Update Environment data
   * @param id
   * @param dto
   * @returns
   */
  async updateEnvironment(propertyId: number, dto: UpdatePropertyEnvOwnerDto): Promise<void> {
    // CREATE OPTIONS RELATION - DELETE OLD OPTION
    const { options, numericIds } = await this.deleteAndCreateNewOption(propertyId, dto, [
      PropertyOptionGroup.PATTERN,
      PropertyOptionGroup.ACCESS,
      PropertyOptionGroup.NEIGHBORHOOD,
    ]);

    await this.db.property.update({
      where: { id: propertyId },
      data: { property_options: { create: options }, options_array: { set: numericIds } },
    });

    const data = { distance_dscr: dto.distance_dscr, pattern_dscr: dto.pattern_dscr };

    await this.db.propertyDescription.upsert({
      where: { property_id: propertyId },
      update: data,
      create: { property_id: propertyId, ...data },
    });

    // return updatedProperty;
  }

  /**
   * Update Bedroom and Bathroom data
   * @param propertyId
   * @param dto
   * @returns
   */
  async updateBedroom(propertyId: number, dto: UpdatePropertyBedroomOwnerDto): Promise<void> {
    const total_bedrooms = (dto.bedrooms?.length ?? 0) || 0; //+ dto.master_room ?? 0;

    await this.db.propertyBedroom.upsert({
      where: { property_id: propertyId },
      update: { ...dto, total_bedrooms },
      create: { ...dto, property_id: propertyId, total_bedrooms },
    });
  }

  /**
   * Facility
   * @param propertyId
   * @param dto
   * @returns
   */
  async updateFacility(propertyId: number, dto: UpdatePropertyFacilityOwnerDto): Promise<void> {
    // CREATE OPTIONS RELATION - DELETE OLD OPTION
    const { options, numericIds } = await this.deleteAndCreateNewOption(propertyId, dto, [
      PropertyOptionGroup.POOL_TYPE,
      PropertyOptionGroup.ENTERTAINMENT,
      PropertyOptionGroup.KITCHEN,
      PropertyOptionGroup.COOL_HEAT,
      PropertyOptionGroup.WELFARE,
    ]);

    await this.db.property.update({
      where: { id: propertyId },
      data: {
        property_options: { create: options },
        options_array: { set: numericIds },
        has_pool: dto.has_pool,
      },
    });

    // UPDATE DESCRIPTION
    const queryData = { facility_dscr: dto.facility_dscr };

    await this.db.propertyDescription.upsert({
      where: { property_id: propertyId },
      update: queryData,
      create: { property_id: propertyId, ...queryData },
    });

    // return updatedProperty;
  }

  /**
   * Prices and Capacity
   * @param propertyId
   * @param dto
   */
  async updatePrices(propertyId: number, dto: UpdatePropertyPriceOwnerDto): Promise<void> {
    await this.db.property.update({
      where: { id: propertyId },
      data: {
        std_capacity: dto.std_capacity,
        max_capacity: dto.max_capacity,
        advisor_commission: dto.advisor_commission,
      },
    });

    // DAILY
    const dailyQueryData = {
      normal: dto.normal,
      wednesday: dto.wednesday,
      thursday: dto.thursday,
      friday: dto.friday,
      peak: dto.peak,
      cleaning: dto.cleaning,
      additional_person: dto.additional_person,
    };

    await this.db.propertyDailyPrice.upsert({
      where: { property_id: propertyId },
      update: dailyQueryData,
      create: { ...dailyQueryData, property_id: propertyId },
    });
  }

  /**
   * Update canceling and other terms - Last step
   * @param user
   * @param propertyId
   * @param dto
   * @returns
   */
  async updateAssistant(user: PartialUser, propertyId: number, dto: UpdatePropertyOwnerAssistantOwnerDto) {
    const owner = await this.db.user.findUnique({ where: { id: user.id } });

    /* -------------------------------------------------------------------------- */
    /**
     * Transaction: Delete, Create Assistants
     */
    this.db.$transaction(async (tx) => {
      await tx.propertyOwnerAssistant.deleteMany({ where: { property_id: propertyId } });

      if ([1, 3].includes(dto.show_mobile_type)) {
        await tx.propertyOwnerAssistant.create({
          data: {
            property_id: propertyId,
            is_owner: true,
            assistant_mobile_number: owner.mobile_number,
            assistant_full_name: owner.full_name,
          },
        });
      }

      if ([2, 3].includes(dto.show_mobile_type)) {
        await tx.propertyOwnerAssistant.create({
          data: {
            property_id: propertyId,
            assistant_mobile_number: dto?.assistant_mobile,
            assistant_full_name: dto?.assistant_full_name,
          },
        });
      }

      await tx.property.update({ where: { id: propertyId }, data: { contact_type: dto.show_mobile_type } });
    });
  }

  /**
   * Update canceling and other terms - Last step
   * @param property
   * @param dto
   * @returns
   */
  async updateTerms(property: PropertyInterceptorData, dto: UpdatePropertyTermsOwnerDto) {
    const propertyId = property.id;

    /* -------------------------------------------------------------------------- */
    /**
     * Options: delete old options and create new ones
     */
    const { options, numericIds } = await this.deleteAndCreateNewOption(propertyId, dto, [
      PropertyOptionGroup.GUEST_TYPE,
      PropertyOptionGroup.PET,
      PropertyOptionGroup.PARTY,
    ]);

    /* -------------------------------------------------------------------------- */
    /**
     * Transaction: Property, Description, Subscription
     */
    this.db.$transaction(async (tx) => {
      const property = await tx.property.findUnique({ where: { id: propertyId } });
      await tx.property.update({
        where: { id: propertyId },
        data: {
          canceling_type: dto.canceling_type,
          status: property.status == PropertyStatuses.IN_PROCESS ? PropertyStatuses.WAITING : property.status, //skip update in edit
          property_options: { create: options },
          options_array: { set: numericIds },
          check_in_hour: dto.check_in_hour,
          check_out_hour: dto.check_out_hour,
        },
      });

      /* -------------------------------------------------------------------------- */
      /**
       * Description: UPDATE
       */
      const queryData = {
        guest_dscr: dto.guest_dscr,
        pet_dscr: dto.pet_dscr,
        party_dscr: dto.party_dscr,
        doc_dscr: dto.doc_dscr,
        other_dscr: dto.other_dscr,
        ad_dscr: dto.ad_dscr,
        property_dscr: dto.property_dscr,
      };

      await tx.propertyDescription.upsert({
        where: { property_id: propertyId },
        update: queryData,
        create: { property_id: propertyId, ...queryData },
      });
    });
  }

  /**
   * Update advisor commission
   * @param propertyId
   * @param dto
   * @returns
   */
  async updateCommission(propertyId: number, dto: UpdatePropertyAdvisorCommissionOwnerDto): Promise<void> {
    await this.db.property.update({
      where: { id: propertyId },
      data: { advisor_commission: dto.advisor_commission },
    });
  }

  /**
   *
   * @param property
   * @param dto
   */
  async paySubscription(
    user: PartialUser,
    property: PropertyInterceptorData,
    dto: PaySubscriptionPropertyOwnerDto,
  ): Promise<string> {
    let subscription: SubscriptionPlan;
    let promote: SubscriptionPlan;

    /* -------------------------------------------------------------------------- */
    /** */
    await this.checkCanBuySubscriptionForFirstTime(property);

    /* -------------------------------------------------------------------------- */
    /** promote */
    // اگر دفعه اولیست ک اشتراک خریداری میشود، اجازه خرید نردبان را ندارد
    if (dto.promote_id) {
      promote = await this.subscriptionPlanUserService.checkCanBuyPromote(dto.promote_id, property);
      if (!promote) throw new BadRequestException('PROPERTY_SUB1');
    }

    /* -------------------------------------------------------------------------- */
    /** subscription */
    // اولین پرداخت باید پرداخت اشتراک باشد
    if (!property.subscription_expired_at && !dto.subscription_id)
      throw new BadRequestException('PROPERTY_SUB3');

    if (dto.subscription_id)
      subscription = await this.subscriptionPlanUserService.findOne(dto.subscription_id);

    /* -------------------------------------------------------------------------- */
    /**
     * Transaction: payment, promote, subscription
     */

    const pay = await this.db.$transaction(async (tx) => {
      /* -------------------------------------------------------------------------- */
      /** payment */
      let amount = 0;
      if (subscription) amount += subscription?.price_with_discount || subscription?.price;
      if (promote) amount += promote?.price_with_discount || promote?.price;

      const pay = await this.paymentUserService.create(
        user,
        amount,
        dto.redirect_url,
        dto.gateway,
        TurnoverType.PAY_SUBSCRIPTION,
        tx,
      );

      // حذف تمام درخواست پرداخت های پرداخت نشده
      await tx.subscription.deleteMany({
        where: { property_id: property.id, status: SubscriptionStatus.WAITING },
      });

      if (promote)
        await tx.subscription.create({
          data: {
            property_id: property.id,
            is_promote: true,
            payment_id: pay.payment.id,
            title: promote.title,
            duration: promote.duration,
            price: promote.price,
            status: SubscriptionStatus.WAITING,
          },
        });

      if (subscription)
        await tx.subscription.create({
          data: {
            property_id: property.id,
            payment_id: pay.payment.id,
            title: subscription.title,
            duration: subscription.duration,
            price: subscription.price,
            status: SubscriptionStatus.WAITING,
          },
        });

      return pay;
    });

    return pay.paymentUrl;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all Property
   * @param dto
   * @returns
   */
  async findAll(ownerId: number): Promise<Array<PropertyArrayResType>> {
    const calendarDateQuery: Prisma.PropertyCalendarWhereInput = {
      date: { gte: startOfToday(), lt: startOfDate(moment().add(8, 'days').toDate()) },
    };

    const list = await this.db.property.findMany({
      where: { owner_id: ownerId },
      include: {
        feature_image: true,
        province: { select: { title: true } },
        city: { select: { title: true } },
        property_options: true,
        daily_price: true,
        calendar: { where: calendarDateQuery, orderBy: { date: 'asc' } },
        bedrooms: { select: { total_bedrooms: true } },
        _count: { select: { attachments: true } },
        property_authorize: true,
        blue_tick: true,
        favorites: true,
      },
    });

    const today = await this.dayHelper.today();
    const serialized = await this.propertySerializer.toArray(list, today, false);
    return serialized;
  }

  /**
   * find one property
   * owner checked in interceptor
   * @param propertyId
   * @returns
   */
  async findOne(propertyId: number): Promise<PropertyResType> {
    const calendarDateQuery: Prisma.PropertyCalendarWhereInput = {
      date: { gte: startOfToday(), lt: startOfDate(moment().add(8, 'days').toDate()) },
    };
    const item = await this.db.property.findFirst({
      where: { id: propertyId },
      include: {
        feature_image: true,
        attachments: true,
        province: { select: { title: true } },
        city: { select: { title: true } },
        daily_price: true,
        calendar: { where: calendarDateQuery, orderBy: { date: 'asc' } },
        property_authorize: true,
        favorites: true,
      },
    });

    if (!item) throw new NotFoundException('PROPERTY_NOT_FOUND');

    const today = await this.dayHelper.today();
    const serialized = await this.propertySerializer.toJSON(item, today, false, true);

    return serialized;
  }

  /**
   * calendar
   * @param propertyId
   * @param dto
   * @returns
   */
  async findPropertyCalendar(
    property: Property,
    month: number,
    year: number,
    isAdvisor = false,
    isOwner = false,
  ): Promise<any> {
    const calendar = await this.db.propertyCalendar.findMany({
      where: { property_id: property.id, month, year },
      omit: { created_at: true, id: true, updated_at: true, property_id: true },
    });

    const dailyPrice = await this.db.propertyDailyPrice.findFirst({
      where: { property_id: property.id },
    });

    const daysRange = await this.dayHelper.daysRange(convertJalaaliDtoToDate({ year, month, day: 1 }), 31);

    let prices = [];
    for (let i = 1; i <= 31; i++) {
      const date = convertJalaaliDtoToDate({ year, month, day: i });

      const today = daysRange.requestedDays[i - 1];
      const isPeak = today === DayColumn.peak;
      const cal = calendar?.find((e) => e.day === i && e.month === month && e.year === year);

      prices.push({
        date,
        day: i,
        month,
        year,
        price: cal?.price ?? dailyPrice[today],
        discounted_price: cal?.discounted_price ?? null,
        note: cal?.note ?? null,
        is_reserved: isOwner || isAdvisor ? cal?.is_reserved : null,
        is_peak: isPeak,
        advisor_commission: isOwner ? cal?.advisor_commission || property.advisor_commission : null, // just for owner
      });
    }

    return prices;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  async remove(propertyId: number): Promise<void> {
    await this.db.property.delete({ where: { id: propertyId } });
  }

  /* -------------------------------------------------------------------------- */
  /*                                 STATISTICS                                 */
  /* -------------------------------------------------------------------------- */

  /**
   *
   * @param propertyId
   */
  async findStatistics(propertyId: number): Promise<Partial<PropertyStatistics>[]> {
    const aWeekAgo = startOfDate(moment().subtract(8, 'days').toDate());
    const now = startOfToday();

    const list = await this.db.propertyStatistics.findMany({
      where: { property_id: propertyId, date: { gte: aWeekAgo, lte: now } },
      select: { id: true, date: true, view_count: true },
    });

    return list;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPER                                   */
  /* -------------------------------------------------------------------------- */
  /**
   *
   * @param propertyId
   * @param dto
   * @param groups
   * @returns
   */
  async deleteAndCreateNewOption(
    propertyId: number,
    dto: any,
    groups: PropertyOptionGroup[],
  ): Promise<{ options: OptionConnect[]; numericIds: number[] }> {
    /* -------------------------------------------------------------------------- */
    // delete old records
    await this.db.optionsOnProperty.deleteMany({
      where: {
        property_id: propertyId,
        option: {
          group: {
            in: groups,
          },
        },
      },
    });

    const remainedOptions = await this.db.optionsOnProperty.findMany({
      where: {
        property_id: propertyId,
      },
      select: { option_id: true },
    });

    /* -------------------------------------------------------------------------- */
    // create new data
    let optionsQuery = [];
    let numericIds = remainedOptions.map((e) => e.option_id);

    for (const e of groups) {
      const data = dto[e.toLowerCase()];
      if (!data) continue;
      if (Array.isArray(data)) {
        numericIds.push(...data);
        data.map((v) => optionsQuery.push({ option: { connect: { id: v } } }));
      } else {
        numericIds.push(data);
        optionsQuery.push({
          option: { connect: { id: data } },
        });
      }
    }

    return { options: optionsQuery, numericIds };
  }

  /**
   *
   * @param property
   */
  async checkCanBuySubscriptionForFirstTime(property: Property): Promise<void> {
    // در مرحله ثبت ملک فقط یکبار اشتراک میتوان خرید کرد
    const firstSub = await this.db.subscription.findFirst({
      where: { property_id: property.id, status: SubscriptionStatus.SUCCESS },
    });

    if (property.status === PropertyStatuses.WAITING && firstSub)
      throw new BadRequestException('PROPERTY_SUB4');
  }
}
