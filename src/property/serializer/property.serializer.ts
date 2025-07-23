import {
  Attachment,
  City,
  Favorite,
  Owner,
  Property,
  PropertyAuthorize,
  PropertyBadge,
  PropertyBedroom,
  PropertyCalendar,
  PropertyDailyPrice,
  PropertyDescription,
  PropertyOption,
  PropertyOwnerAssistant,
  User,
} from '@prisma/client';
import { EnumList } from 'src/common/interfaces/model-props.interface';
import { PropertyStatuses, PropertyStatusesList } from '../common/types/property-status.type';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';
import { DayColumn } from 'src/common/helpers/day.helper';
import { object } from 'joi';
import moment from 'moment-jalaali';
import { RentType } from '../common/types/property-rent-types.type';
import { PropertyAuthorizeStatusesList } from 'src/property-authorize/common/property-authorize-status.type';
import { PropertyBadgeStatusList } from 'src/property-badge/common/property-badge-status.type';
import { startOfDate, startOfToday } from 'src/common/helpers/date.helper';
import { CancelingTypeList } from '../common/types/property-canceling-types.type';
import { isEmpty } from 'lodash';

type TodayPrice = { price: number; discounted_price: number | null; discount_percentage: number | null };

type ReserveDay = { day_number: number; is_reserved: boolean };

export type PropertyJsonType = Property & {
  feature_image?: Attachment;
  attachments?: Attachment[];
  province: Partial<City>;
  city: Partial<City>;
  region?: Partial<City>;
  _count?: { attachments: number };
  property_options?: any[]; //مالک نیازی به این دیتا ندارد
  bedrooms?: Partial<PropertyBedroom>; //مالک نیازی به این دیتا ندارد
  daily_price?: PropertyDailyPrice; //مالک نیازی به این دیتا ندارد
  description?: PropertyDescription; //مالک نیازی به این دیتا ندارد
  property_authorize?: PropertyAuthorize;
  blue_tick?: PropertyBadge;
  calendar?: PropertyCalendar[];
  reserve_days?: ReserveDay[];
  status_number?: number;
  owner?: Owner & { user: User };
};

export type PropertyArrayResType = {
  owner?: { id: number; mobile_number: string; full_name: string };
  id: number;
  code: string;
  title: string;
  slug: string;
  std_capacity: number;
  max_capacity: number;
  total_bedrooms: number;
  bedrooms: any;
  has_pool: boolean;
  feature_image: Attachment;
  attachments_count: number;
  images: Attachment[];
  province: string;
  city: string;
  region: string;
  status: EnumList;
  advisor_commission: number;
  today_price: TodayPrice;
  is_today_reserved: boolean;
  remaining_days: number;
  is_authorized: boolean;
  has_blue_tick: boolean;
  authorize_status: EnumList;
  blue_tick_status: EnumList;
  reserve_days?: ReserveDay[];
  status_number?: number;
  favorite_count: number;
  created_at: Date;
  // rate:number;
};

export type PropertyJsonResType = {
  owner?: { id: number; mobile_number: string; full_name: string };
  latitude: number;
  longitude: number;
  land_area: number;
  building_area: number;
  floors: number;
  unit_per_floor: number;
  floor: number;
  construction_year: number;
  daily_price: PropertyDailyPrice;
  address: string;
  options: object[];
  property_descriptions: PropertyDescription;
  rent_type: RentType;
  is_chat_enabled: boolean;
  reserve_days?: ReserveDay[];
  status_number?: number;
  canceling_type?: EnumList;
  admin_descriptions?: any;
  check_in_hour: string;
  check_out_hour: string;
};

export type PropertyResType = PropertyArrayResType & PropertyJsonResType;

export class PropertySerializer {
  async toArray(
    data: PropertyJsonType[],
    today: DayColumn,
    isAdvisor = false,
    isOwner: boolean,
  ): Promise<Array<PropertyArrayResType>> {
    const res: PropertyArrayResType[] = [];
    for (const e of data) {
      res.push({
        ...this.summarize(e, today, true, isAdvisor, isOwner),
      });
    }

    return res;
  }

  async toJSON(
    data: PropertyJsonType,
    today: DayColumn,
    isAdvisor = false,
    isOwner = false,
  ): Promise<PropertyResType> {
    const res = { ...this.summarize(data, today, false, isAdvisor, isOwner) };
    return res;
  }

  formatPropertyOptions(options: any, key: keyof PropertyOption): object[] {
    const arrayKeys: readonly string[] = [
      PropertyOptionGroup.ENTERTAINMENT,
      PropertyOptionGroup.COOL_HEAT,
      PropertyOptionGroup.WELFARE,
      PropertyOptionGroup.KITCHEN,
      PropertyOptionGroup.GUEST_TYPE,
      PropertyOptionGroup.POOL_TYPE,
    ];
    const groupByOption = options?.reduce((list, item) => {
      const group = item.option?.group?.toLowerCase() || 'unknow_key';
      if (arrayKeys.includes(group.toUpperCase())) {
        list[group] = list[group] ?? [];
        list[group].push(item.option[key]);
      } else {
        list[group] = item.option[key];
      }
      return list;
    }, {});
    return groupByOption;
  }

  private findTodayPrice(
    calendar: PropertyCalendar,
    today: DayColumn,
    dailyPrice: PropertyDailyPrice,
  ): TodayPrice {
    if (calendar?.effective_price)
      return {
        price: calendar.price,
        discounted_price: calendar.discounted_price,
        discount_percentage: calendar.discount_percentage,
      };

    return { price: dailyPrice?.[today], discounted_price: null, discount_percentage: null };
  }

  /**
   * حالتهای مختلف وجود تصاویر آگهی
   * @param feature_image
   * @param attachments
   * @returns
   */
  private findImages(feature_image?: Attachment, attachments?: Attachment[]) {
    if (!feature_image && isEmpty(attachments)) return [];
    if (!feature_image && !isEmpty(attachments)) return attachments;
    if (feature_image && isEmpty(attachments)) return [feature_image];
    if (feature_image && !isEmpty(attachments))
      return [feature_image].concat(attachments?.filter((e) => e.id !== feature_image.id) || []) || [];
  }

  private findStatus(remainingDays: number, status: PropertyStatuses): EnumList {
    if (!remainingDays || remainingDays <= 0) {
      // if (status === PropertyStatuses.WAITING)
      //   return {
      //     id: 1,
      //     title: 'در انتظار پرداخت',
      //     hex: '#F53E4F',
      //   };
      // else
      if (status === PropertyStatuses.PUBLISHED)
        return {
          id: 11,
          title: 'منقضی شده',
          hex: '#EF4444',
        };
    }

    return PropertyStatusesList.find((_) => _.id === status);
  }

  summarize(
    data: PropertyJsonType,
    today: DayColumn,
    isList: boolean,
    isAdvisor: boolean,
    isOwner: boolean,
  ): PropertyResType {
    if (!data) return;
    let single: PropertyJsonResType;

    console.dir(data);
    const remainingDays = moment(data.subscription_expired_at).diff(moment.now(), 'days') + 1;
    const todayInPropertyCalendar = data.calendar?.find(
      (e) => moment(e.date).diff(startOfToday(), 'm') === 0,
    );

    let list: PropertyArrayResType = {
      id: data.id,
      code: data.code,
      title: data.title,
      slug: data.slug,
      owner: data?.owner
        ? {
            id: data.owner_id,
            mobile_number: data.owner.user.mobile_number,
            full_name: data.owner.user.full_name,
          }
        : null,
      feature_image: data.feature_image,
      attachments_count: data._count?.attachments || 0,
      images: this.findImages(data.feature_image, data.attachments),
      std_capacity: data.std_capacity,
      max_capacity: data.max_capacity,
      total_bedrooms: data.bedrooms?.total_bedrooms || 0,
      bedrooms: data.bedrooms,
      has_pool: data.has_pool,
      province: data.province?.title,
      city: data.city?.title,
      region: data.region?.title,
      advisor_commission:
        !isAdvisor && !isOwner
          ? null
          : todayInPropertyCalendar?.advisor_commission ?? data.advisor_commission,
      today_price: this.findTodayPrice(todayInPropertyCalendar, today, data.daily_price),
      is_today_reserved: !!todayInPropertyCalendar?.is_reserved,
      is_authorized: data.is_authorized,
      has_blue_tick: data.has_blue_tick,
      favorite_count: data?.favorite_count,
      status_number: data.status,
      //اگر زمان باقیمانده کمتر از صفر است و وضعیت در انتظار پرداخت است یعنی آگهی تازه ثبت شده پس پیام متفاوتی نشون میدیم
      status: this.findStatus(remainingDays, data.status),
      created_at: data.created_at,
      //owner
      remaining_days: !remainingDays || remainingDays < 0 ? 0 : remainingDays,
      authorize_status: data.hasOwnProperty('property_authorize')
        ? PropertyAuthorizeStatusesList.find((e) => e.id === data.property_authorize?.status)
        : null,
      blue_tick_status: data.hasOwnProperty('blue_tick')
        ? PropertyBadgeStatusList.find((e) => e.id === data.blue_tick?.status)
        : null,
    };

    if (!isList)
      single = {
        admin_descriptions: data.admin_descriptions,
        canceling_type: CancelingTypeList.find((e) => e.id == data.canceling_type),
        daily_price: data.daily_price || null,
        latitude: data.is_location_visible || isOwner ? data.lat : null,
        longitude: data.is_location_visible || isOwner ? data.lng : null,
        land_area: data.land_area,
        building_area: data.building_area,
        floors: data.floors,
        unit_per_floor: data.unit_per_floor,
        floor: data.floor,
        construction_year: data.construction_year,
        address: data.address,
        options: this.formatPropertyOptions(data.property_options, 'title'),
        property_descriptions: data.description,
        rent_type: RentType.DAILY,
        is_chat_enabled: data.is_chat_enabled,
        check_in_hour: data.check_in_hour,
        check_out_hour: data.check_out_hour,
      };

    let reserveDays: ReserveDay[] = [];
    for (let i = 0; i < 7; i++) {
      const date = startOfDate(moment().add(i, 'day').toDate());
      const calendar = data.calendar.find((e) => moment(e.date).isSame(date));
      reserveDays.push({ day_number: moment(date).day(), is_reserved: Boolean(calendar?.is_reserved) });
    }

    let res: PropertyResType = { ...list, ...single, reserve_days: isAdvisor || isOwner ? reserveDays : [] };
    return res;
  }
}
