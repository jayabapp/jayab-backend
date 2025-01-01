import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Property, Prisma, Owner, User, SubscriptionPlan } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { InProgressReserveStatus, PropertyStatuses } from 'src/property/common/types/property-status.type';
import { OptionConnect } from 'src/common/interfaces/option-connect.interface';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';
import { random } from 'lodash';
import { FindAllPropertyOwnerDto } from './dto/find-all.dto';
import { UpdatePropertyOwnerDto } from './dto/update.dto';
import { CreatePropertyOwnerDto } from './dto/create.dto';
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
import { RentType } from 'src/property/common/types/property-rent-types.type';
import { PropertyInterceptorData } from 'src/property/common/interceptors/owner-property.interceptor';
import { PartialUser } from 'src/common/interfaces/user.interface';
import { PaySubscriptionPropertyOwnerDto } from './dto/pay-subscription.dto';
import moment from 'moment-jalaali';
import { SubscriptionPlanUserService } from 'src/subscription-plan/roles/user/user.service';
import { PropertySubscription } from 'src/property/common/types/property-subscription.type';
import { PaymentUserService } from 'src/payment/roles/user/user.service';

@Injectable()
export class PropertyOwnerService {
  constructor(
    private readonly db: PrismaService,
    private readonly subscriptionPlanUserService: SubscriptionPlanUserService,
    private readonly paymentUserService: PaymentUserService,
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
        select: { assistant_full_name: true, assistant_mobile_number: true, owner_mobile_number: true },
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
    /* -------------------------------------------------------------------------- */
    // data without options
    let data: Prisma.PropertyUncheckedUpdateInput = {
      province_id: dto.province_id,
      region_id: dto.region_id || null,
      city_id: dto.city_id,
      title: dto.title,
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
    if (property.status == PropertyStatuses.INIT) data = { ...data, status: PropertyStatuses.IN_PROCESS };

    /* -------------------------------------------------------------------------- */
    // create options relations - delete old options
    const options: OptionConnect[] = await this.deleteAndCreateNewOption(property.id, dto, [
      PropertyOptionGroup.PROPERTY_TYPE,
      PropertyOptionGroup.OWNERSHIP,
      PropertyOptionGroup.BUILDING_DIRECTION,
    ]);

    /* -------------------------------------------------------------------------- */
    const prop = await this.db.property.update({
      where: { id: property.id },
      data: { ...data, property_options: { create: options } },
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
    const query: OptionConnect[] = await this.deleteAndCreateNewOption(propertyId, dto, [
      PropertyOptionGroup.PATTERN,
      PropertyOptionGroup.ACCESS,
      PropertyOptionGroup.NEIGHBORHOOD,
    ]);

    const updatedProperty = await this.db.property.update({
      where: { id: propertyId },
      data: { property_options: { create: query } },
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

    const upsertPropertyBedroom = await this.db.propertyBedroom.upsert({
      where: { property_id: propertyId },
      update: { ...dto, total_bedrooms },
      create: { ...dto, property_id: propertyId, total_bedrooms },
    });

    // return  upsertPropertyBedroom
  }

  /**
   * Facility
   * @param propertyId
   * @param dto
   * @returns
   */
  async updateFacility(propertyId: number, dto: UpdatePropertyFacilityOwnerDto): Promise<void> {
    // CREATE OPTIONS RELATION - DELETE OLD OPTION
    const query: OptionConnect[] = await this.deleteAndCreateNewOption(propertyId, dto, [
      PropertyOptionGroup.POOL_TYPE,
      PropertyOptionGroup.ENTERTAINMENT,
      PropertyOptionGroup.KITCHEN,
      PropertyOptionGroup.COOL_HEAT,
      PropertyOptionGroup.WELFARE,
    ]);

    const updatedProperty = await this.db.property.update({
      where: { id: propertyId },
      data: { property_options: { create: query }, has_pool: dto.has_pool },
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
    let data: Prisma.PropertyOwnerAssistantUncheckedCreateInput = {
      property_id: propertyId,
      owner_mobile_number: user.mobile_number,
      assistant_mobile_number: dto?.assistant_mobile,
      assistant_full_name: dto?.assistant_full_name,
    };

    switch (dto.show_mobile_type) {
      // نمایش شماره مالک بر روی آگهی
      case 1:
        data = { ...data, assistant_mobile_number: null, assistant_full_name: null };
        break;

      // نمایش شماره دستیار بر روی آگهی
      case 2:
        data = { ...data, owner_mobile_number: null };
        break;

      // نمایش هر دو شماره بر روی آگهی - که حالت دیفالت رو همین در نظر گرفتیم
      case 3:
        break;
    }

    /* -------------------------------------------------------------------------- */
    /**
     * Transaction: Delete, Create Assistants
     */
    this.db.$transaction(async (tx) => {
      await tx.propertyOwnerAssistant.deleteMany({ where: { property_id: propertyId } });
      await tx.propertyOwnerAssistant.create({ data });
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
    const query: OptionConnect[] = await this.deleteAndCreateNewOption(propertyId, dto, [
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
          property_options: { create: query },
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
    if (dto.promote_id)
      promote = await this.subscriptionPlanUserService.checkCanBuyPromote(dto.promote_id, property);

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

      const pay = await this.paymentUserService.create(user, amount, dto.redirect_url, dto.gateway, tx);

      // حذف تمام درخواست پرداخت های پرداخت نشده
      await tx.subscription.deleteMany({
        where: { property_id: property.id, status: PropertySubscription.WAITING },
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
            status: PropertySubscription.WAITING,
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
            status: PropertySubscription.WAITING,
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
  async findAll(dto: FindAllPropertyOwnerDto): Promise<CursorPaginatedResult<Property>> {
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
  async findOne(propertyId: number, ownerId: number): Promise<Property> {
    const item = await this.db.property.findFirst({
      where: { id: propertyId, owner_id: ownerId },
    });

    if (!item) throw new NotFoundException('PROPERTY_NOT_FOUND');

    return item;
  }

  /**
   * update
   * @param propertyId
   * @param dto
   * @returns
   */
  async update(propertyId: number, dto: UpdatePropertyOwnerDto): Promise<Property> {
    const item = await this.db.property.update({
      where: { id: propertyId },
      data: dto,
    });

    return item;
  }

  // /**
  //  * remove
  //  * @param propertyId
  //  */
  // async remove(propertyId: number): Promise<void> {
  //   await this.db.property.delete({ where: { id: propertyId } });
  // }

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
  ): Promise<OptionConnect[]> {
    /* -------------------------------------------------------------------------- */
    // delete old records
    const a = await this.db.optionsOnProperty.deleteMany({
      where: {
        property_id: propertyId,
        option: {
          group: {
            in: groups,
          },
        },
      },
    });

    /* -------------------------------------------------------------------------- */
    // create new data
    let optionsQuery = [];
    for (const e of groups) {
      const data = dto[e.toLowerCase()];
      if (!data) continue;
      if (Array.isArray(data)) data.map((v) => optionsQuery.push({ option: { connect: { id: v } } }));
      else
        optionsQuery.push({
          option: { connect: { id: data } },
        });
    }

    return optionsQuery;
  }

  /**
   *
   * @param property
   */
  async checkCanBuySubscriptionForFirstTime(property: Property): Promise<void> {
    // در مرحله ثبت ملک فقط یکبار اشتراک میتوان خرید کرد
    const firstSub = await this.db.subscription.findFirst({
      where: { property_id: property.id, status: PropertySubscription.SUCCESS },
    });

    if (property.status == PropertyStatuses.WAITING && firstSub)
      throw new BadRequestException('PROPERTY_SUB4');
  }
}
