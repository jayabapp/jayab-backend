import { Prisma, Property, PropertyStatistics, SubscriptionPlan } from '@prisma/client';
import { convertJalaaliDtoToDate, startOfDate, startOfToday } from 'src/common/helpers/date.helper';
import { DayColumn, DayHelper, resolveDayColumn, toDayKey } from 'src/common/helpers/day.helper';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InProgressReserveStatus, PropertyStatuses } from 'src/property/common/types/property-status.type';
import { UpdatePropertyAdvisorCommissionOwnerDto } from './dto/update.dto';
import { PropertyResType, PropertySerializer } from 'src/property/serializer/property.serializer';
import { PropertyPhotoUpgradeRequestStatus } from 'src/property/common/types/property-photo-upgrade-status.type';
import { difference, isEmpty, random, xor } from 'lodash';
import { PaySubscriptionPropertyOwnerDto } from './dto/pay-subscription.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SubscriptionPlanUserService } from 'src/subscription-plan/roles/user/user.service';
import { PropertyInterceptorData } from 'src/property/common/interceptors/owner-property.interceptor';
import { PropertyArrayResType } from 'src/property/serializer/property.serializer';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';
import { SettingAdminService } from 'src/setting/roles/admin/admin.service';
import { PaymentUserService } from 'src/payment/roles/user/user.service';
import { SubscriptionStatus } from 'src/subscription/common/subscription-status.type';
import { resolveNightPrice } from 'src/property/common/night-price.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { OptionConnect } from 'src/common/interfaces/option-connect.interface';
import { TurnoverType } from 'src/payment/common/turnover-type.enum';
import { PartialUser } from 'src/common/interfaces/user.interface';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { SettingKey } from 'src/setting/common/interfaces/settings.interface';
import { slugify } from 'src/common/helpers/slugify';
import { Redis } from 'ioredis';
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

import moment from 'moment-jalaali';

type PhotoUpgradeQuote = {
  property_id: number;
  image_ids: number[];
  image_count: number;
  price_per_image: number;
  total_amount: number;
};

@Injectable()
export class PropertyOwnerService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly db: PrismaService,
    private readonly subscriptionPlanUserService: SubscriptionPlanUserService,
    private readonly paymentUserService: PaymentUserService,
    private readonly propertySerializer: PropertySerializer,
    private readonly dayHelper: DayHelper,
    private readonly setting: SettingAdminService,
  ) {}

  async findLastInitProp(ownerId: number, propertyId?: number): Promise<Property> {
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
      property_images: {
        where: { attachment: { type: 1 } },
        include: { attachment: true },
        orderBy: { sort_order: 'asc' },
      },
      assistants: {
        select: { assistant_full_name: true, assistant_mobile_number: true, is_owner: true },
      },
      bedrooms: true,
    };

    const initProp = await this.db.property.findFirst({ where: query, include });
    if (propertyId && !initProp) throw new NotFoundException('PROPERTY_NOT_FOUND');
    if (initProp)
      return {
        ...initProp,
        attachments: initProp.property_images.map((propertyImage: any) => propertyImage.attachment),
      } as any;

    let code: string;
    do {
      code = `${random(10_000, 99_999).toString()}`;
    } while (await this.db.property.findUnique({ where: { code } }));

    const newProp = await this.db.property.create({
      data: { owner_id: ownerId, status: PropertyStatuses.INIT, code },
      include,
    });
    return newProp;
  }

  async updateInit(property: Property, dto: UpdatePropertyStepOneOwnerDto): Promise<void> {
    const slug = `${property.code}-${slugify(dto.title)}`;

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
    if (property.status === PropertyStatuses.INIT) data = { ...data, status: PropertyStatuses.IN_PROCESS };
    const city = await this.db.city.findUnique({
      where: { id: dto.city_id },
      select: { _count: { select: { child: true } } },
    });
    if (city._count.child > 0 && !dto.region_id) throw new BadRequestException('PROPERTY1');
    const { options, numericIds } = await this.deleteAndCreateNewOption(property.id, dto, [
      PropertyOptionGroup.PROPERTY_TYPE,
      PropertyOptionGroup.OWNERSHIP,
      PropertyOptionGroup.BUILDING_DIRECTION,
    ]);

    await this.db.property.update({
      where: { id: property.id },
      data: { ...data, property_options: { create: options }, options_array: { set: numericIds } },
    });
  }
  async updateLocation(propertyId: number, dto: UpdatePropertyLocationOwnerDto): Promise<void> {
    const prop = await this.db.property.update({
      where: { id: propertyId },
      data: { lat: Number(dto.lat.toFixed(6)), lng: Number(dto.lng.toFixed(6)) },
    });
  }

  async updateMedia(property: Property, dto: UpdatePropertyMediaOwnerDto): Promise<void> {
    const propertyAttachments = await this.db.propertyImage.findMany({
      where: { property_id: property.id },
      select: { attachment_id: true },
      orderBy: { sort_order: 'asc' },
    });

    const currentAttachmentIds = propertyAttachments.map((e) => e.attachment_id);
    if (isEmpty(xor(dto.images, currentAttachmentIds))) {
      if (dto.feature_image_id !== property.feature_image_id)
        await this.db.property.update({
          where: { id: property.id },
          data: { feature_image_id: dto.feature_image_id },
        });
      return;
    }
    const images = Array.from(new Set(dto.images || []));
    let status = property.status;
    if (property.status === PropertyStatuses.PUBLISHED) status = PropertyStatuses.EDITED;
    await this.db.property.update({
      where: { id: property.id },
      data: {
        status,
        property_images: {
          deleteMany: {},
          create: images.map((attachmentId, index) => ({
            attachment_id: attachmentId,
            sort_order: index,
          })),
        },
        feature_image_id: dto.feature_image_id,
        // video_id: dto.video_id || null,
      },
    });
  }

  async updateEnvironment(propertyId: number, dto: UpdatePropertyEnvOwnerDto): Promise<void> {
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
  }

  async updateBedroom(propertyId: number, dto: UpdatePropertyBedroomOwnerDto): Promise<void> {
    const total_bedrooms = (dto.bedrooms?.length ?? 0) || 0;
    await this.db.propertyBedroom.upsert({
      where: { property_id: propertyId },
      update: { ...dto, total_bedrooms },
      create: { ...dto, property_id: propertyId, total_bedrooms },
    });
  }

  async updateFacility(propertyId: number, dto: UpdatePropertyFacilityOwnerDto): Promise<void> {
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

    const queryData = { facility_dscr: dto.facility_dscr };
    await this.db.propertyDescription.upsert({
      where: { property_id: propertyId },
      update: queryData,
      create: { property_id: propertyId, ...queryData },
    });
  }

  async updatePrices(propertyId: number, dto: UpdatePropertyPriceOwnerDto): Promise<void> {
    await this.db.property.update({
      where: { id: propertyId },
      data: {
        std_capacity: dto.std_capacity,
        max_capacity: dto.max_capacity,
        advisor_commission: dto.advisor_commission,
      },
    });
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

  async updateAssistant(user: PartialUser, propertyId: number, dto: UpdatePropertyOwnerAssistantOwnerDto) {
    const owner = await this.db.user.findUnique({ where: { id: user.id } });
    const property = await this.db.$transaction(async (tx) => {
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

      const property = await tx.property.update({
        where: { id: propertyId },
        data: { contact_type: dto.show_mobile_type },
        select: { code: true },
      });
      return property;
    });
    await this.redis.del(`contact:${property.code}`);
  }

  async updateTerms(property: PropertyInterceptorData, dto: UpdatePropertyTermsOwnerDto) {
    const propertyId = property.id;
    const { options, numericIds } = await this.deleteAndCreateNewOption(propertyId, dto, [
      PropertyOptionGroup.GUEST_TYPE,
      PropertyOptionGroup.PET,
      PropertyOptionGroup.PARTY,
    ]);

    await this.db.$transaction(async (tx) => {
      const property = await tx.property.findUnique({ where: { id: propertyId } });

      let status = property.status;
      if (property.status == PropertyStatuses.IN_PROCESS) {
        const contacts = await tx.propertyOwnerAssistant.findMany({
          where: { property_id: propertyId },
          select: { assistant_mobile_number: true },
        });
        const hasContact = contacts.some((contact) => contact.assistant_mobile_number?.trim());
        if (!hasContact) throw new BadRequestException('PROPERTY2');

        status = PropertyStatuses.WAITING;
      }

      await tx.property.update({
        where: { id: propertyId },
        data: {
          canceling_type: dto.canceling_type,
          status,
          property_options: { create: options },
          options_array: { set: numericIds },
          check_in_hour: dto.check_in_hour,
          check_out_hour: dto.check_out_hour,
        },
      });

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

  async updateCommission(propertyId: number, dto: UpdatePropertyAdvisorCommissionOwnerDto): Promise<void> {
    await this.db.property.update({
      where: { id: propertyId },
      data: { advisor_commission: dto.advisor_commission },
    });
  }
  async paySubscription(
    user: PartialUser,
    property: PropertyInterceptorData,
    dto: PaySubscriptionPropertyOwnerDto,
  ): Promise<string> {
    let subscription: SubscriptionPlan;
    let promote: SubscriptionPlan;
    let photoUpgradeQuote: PhotoUpgradeQuote = null;

    if (!dto.subscription_id && !dto.photo_upgrade_enabled && !dto.promote_id)
      throw new UnprocessableEntityException('BUY_SUBSCRIPTION3');
    await this.checkCanBuySubscriptionForFirstTime(property);
    if (dto.promote_id) {
      promote = await this.subscriptionPlanUserService.checkCanBuyPromote(
        dto.promote_id,
        dto.subscription_id,
        property,
      );
      if (!promote) throw new BadRequestException('PROPERTY_SUB1');
    }

    if (!property.subscription_expired_at && !dto.subscription_id)
      throw new BadRequestException('PROPERTY_SUB3');
    if (dto.subscription_id)
      subscription = await this.subscriptionPlanUserService.findOne(dto.subscription_id);
    if (dto.photo_upgrade_enabled) {
      if (dto.photo_upgrade_image_ids?.length < 1) throw new BadRequestException('PROPERTY_PHOTO_UPGRADE1');
      photoUpgradeQuote = await this.buildPhotoUpgradeQuote(
        user.owner_id,
        property.id,
        dto.photo_upgrade_image_ids,
      );
    }

    const result = await this.db.$transaction(
      async (tx) => {
        let amount = 0;
        if (subscription) amount += subscription?.price_with_discount || subscription?.price;
        if (promote) amount += promote?.price_with_discount || promote?.price;
        if (photoUpgradeQuote) amount += photoUpgradeQuote.total_amount;

        const pay = await this.paymentUserService.create(
          user,
          amount,
          dto.redirect_url,
          dto.gateway,
          TurnoverType.PAY_SUBSCRIPTION,
          tx,
        );
        await tx.propertyPhotoUpgradeRequest.deleteMany({
          where: { property_id: property.id, status: PropertyPhotoUpgradeRequestStatus.WAITING_PAYMENT },
        });
        await tx.subscription.deleteMany({
          where: { property_id: property.id, status: SubscriptionStatus.WAITING },
        });

        let subscriptionTitle = '';
        if (subscription?.title) subscriptionTitle += `${subscription.title}`;
        if (promote?.title) subscriptionTitle += `${subscription?.title ? ' - ' : ''}${promote.title}`;
        if (photoUpgradeQuote) subscriptionTitle += `${subscriptionTitle ? ' - ' : ''}ارتقا تصاویر آگهی`;

        const createdSubscription = await tx.subscription.create({
          data: {
            property_id: property.id,
            is_promote: !!dto.promote_id ? true : false,
            payment_id: pay.payment.id,
            title: subscriptionTitle,
            duration: subscription?.duration || 0,
            price: pay.payment.amount,
            status: SubscriptionStatus.WAITING,
            extends_expire: !!subscription,
            has_photo_upgrade_request: !!photoUpgradeQuote,
            description: photoUpgradeQuote
              ? JSON.stringify({
                  photo_upgrade: photoUpgradeQuote,
                  subscription_amount: subscription
                    ? subscription?.price_with_discount || subscription?.price
                    : 0,
                  promote_amount: promote ? promote?.price_with_discount || promote?.price : 0,
                  total_amount: pay.payment.amount,
                })
              : null,
          },
        });

        if (photoUpgradeQuote) {
          await tx.propertyPhotoUpgradeRequest.create({
            data: {
              property_id: photoUpgradeQuote.property_id,
              owner_id: user.owner_id,
              subscription_id: createdSubscription.id,
              payment_id: pay.payment.id,
              status: PropertyPhotoUpgradeRequestStatus.WAITING_PAYMENT,
              image_count: photoUpgradeQuote.image_count,
              price_per_image: photoUpgradeQuote.price_per_image,
              total_amount: photoUpgradeQuote.total_amount,
              items: {
                create: photoUpgradeQuote.image_ids.map((attachmentId) => ({
                  attachment_id: attachmentId,
                })),
              },
            },
          });
        }

        return pay;
      },
      { timeout: 30000, maxWait: 30000 },
    );

    return result.paymentUrl;
  }

  async findAll(ownerId: number): Promise<Array<PropertyArrayResType>> {
    const calendarDateQuery: Prisma.PropertyCalendarWhereInput = {
      date: { gte: startOfToday(), lt: startOfDate(moment().add(8, 'days').toDate()) },
    };

    const list = await this.db.property.findMany({
      where: { owner_id: ownerId, status: { gt: PropertyStatuses.IN_PROCESS } },
      include: {
        feature_image: true,
        province: { select: { title: true } },
        city: { select: { title: true } },
        region: { select: { title: true } },
        property_options: true,
        daily_price: true,
        calendar: { where: calendarDateQuery, orderBy: { date: 'asc' } },
        bedrooms: { select: { total_bedrooms: true } },
        _count: { select: { property_images: true } },
        property_authorize: true,
        blue_tick: true,
        favorites: true,
      },
    });

    const today = await this.dayHelper.today();
    const serialized = await this.propertySerializer.toArray(list, today, false, true);
    return serialized;
  }

  async findOne(propertyId: number): Promise<PropertyResType> {
    const calendarDateQuery: Prisma.PropertyCalendarWhereInput = {
      date: { gte: startOfToday(), lt: startOfDate(moment().add(8, 'days').toDate()) },
    };
    const item = await this.db.property.findFirst({
      where: { id: propertyId },
      include: {
        feature_image: true,
        property_images: { include: { attachment: true }, orderBy: { sort_order: 'asc' } },
        province: { select: { title: true } },
        city: { select: { title: true } },
        region: { select: { title: true } },
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

  async findPropertyCalendar(property: Property, month: number, year: number, isOwner = false): Promise<any> {
    const daysInMonth = moment.jDaysInMonth(year, month - 1);
    const monthStart = convertJalaaliDtoToDate({ year, month, day: 1 });
    const monthEnd = convertJalaaliDtoToDate({ year, month, day: daysInMonth });
    const [calendar, dailyPrice, peakDays] = await Promise.all([
      this.db.propertyCalendar.findMany({
        where: { property_id: property.id, month, year },
        omit: { created_at: true, id: true, updated_at: true, property_id: true },
      }),
      this.db.propertyDailyPrice.findFirst({ where: { property_id: property.id } }),
      this.db.peakDay.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
        select: { date: true },
      }),
    ]);

    const peakDayKeys = new Set(peakDays.map((e) => toDayKey(e.date)));

    const prices = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = convertJalaaliDtoToDate({ year, month, day: i });

      const column = resolveDayColumn(date, peakDayKeys);
      const cal = calendar?.find((e) => e.day === i && e.month === month && e.year === year);
      const { base, final, discounted } = resolveNightPrice(cal, dailyPrice, column);

      prices.push({
        date,
        day: i,
        month,
        year,
        price: base,
        discounted_price: discounted ? final : null,
        note: isOwner ? cal?.note || null : null,
        is_reserved: cal?.is_reserved,
        is_peak: column === DayColumn.peak,
        advisor_commission: isOwner ? cal?.advisor_commission || property.advisor_commission : null, // just for owner
      });
    }
    return prices;
  }

  async remove(propertyId: number): Promise<void> {
    await this.db.property.update({ where: { id: propertyId }, data: { status: PropertyStatuses.DELETED } });
    await this.db.property.delete({ where: { id: propertyId } });
  }

  async findStatistics(propertyId: number): Promise<Partial<PropertyStatistics>[]> {
    const aWeekAgo = startOfDate(moment().subtract(8, 'days').toDate());
    const now = startOfToday();
    const list = await this.db.propertyStatistics.findMany({
      where: { property_id: propertyId, date: { gte: aWeekAgo, lte: now } },
      select: { date: true, view_count: true, impression_count: true },
    });

    const formatted = [];
    for (let i = 0; i < 8; i++) {
      const day = moment(aWeekAgo)
        .add(i + 1, 'day')
        .toDate();
      const record = list.find((e) => moment(e.date).diff(day, 'minute') === 0);

      if (record)
        formatted.push({
          date: record.date,
          view_count: (record.view_count ?? 0) + (record.impression_count ?? 0),
        });
      else formatted.push({ date: day, view_count: 0 });
    }

    return formatted;
  }

  async deleteAndCreateNewOption(
    propertyId: number,
    dto: any,
    groups: PropertyOptionGroup[],
  ): Promise<{ options: OptionConnect[]; numericIds: number[] }> {
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

    const optionsQuery = [];
    const numericIds = remainedOptions.map((e) => e.option_id);

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

  async getPhotoUpgradePrice(): Promise<number> {
    try {
      const value = await this.setting.get(SettingKey.PROPERTY_PHOTO_UPGRADE_PRICE);
      const price = Number(value);
      return Number.isFinite(price) && price > 0 ? price : 50000;
    } catch (error) {
      return 50000;
    }
  }

  async getOptionalSetting(key: SettingKey): Promise<string | null> {
    try {
      const value = await this.setting.get(key);
      return value ? String(value) : null;
    } catch (error) {
      return null;
    }
  }

  async buildPhotoUpgradeQuote(
    ownerId: number,
    propertyId: number,
    imageIds?: number[],
  ): Promise<PhotoUpgradeQuote> {
    const property = await this.db.property.findFirst({
      where: { id: propertyId, owner_id: ownerId, status: { gt: PropertyStatuses.IN_PROCESS } },
      select: {
        id: true,
        feature_image_id: true,
        property_images: {
          where: {
            attachment: {
              type: 1,
              ...(imageIds?.length ? { id: { in: imageIds } } : {}),
            },
          },
          select: { attachment_id: true },
        },
      },
    });

    if (!property) throw new NotFoundException('PROPERTY_NOT_FOUND');

    const propertyImagesIds = property.property_images
      ?.map((e) => e.attachment_id)
      .concat(property.feature_image_id);
    if (!isEmpty(difference(imageIds, propertyImagesIds))) throw new BadRequestException('PHOTO_UPGRADE1');

    const pricePerImage = await this.getPhotoUpgradePrice();

    return {
      property_id: property.id,
      image_ids: imageIds,
      image_count: imageIds.length,
      price_per_image: pricePerImage,
      total_amount: imageIds.length * pricePerImage,
    };
  }

  async checkCanBuySubscriptionForFirstTime(property: Property): Promise<void> {
    const firstSub = await this.db.subscription.findFirst({
      where: { property_id: property.id, status: SubscriptionStatus.SUCCESS },
    });
    if (property.status === PropertyStatuses.WAITING && firstSub)
      throw new BadRequestException('PROPERTY_SUB4');
  }
}
