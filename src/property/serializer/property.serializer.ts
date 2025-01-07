import {
  Attachment,
  City,
  Property,
  PropertyAuthorize,
  PropertyBadge,
  PropertyBedroom,
  PropertyDailyPrice,
  PropertyDescription,
  PropertyOption,
  PropertyOwnerAssistant,
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

export type PropertyJsonType = Property & {
  feature_image?: Attachment;
  attachments?: Attachment[];
  bedrooms: Partial<PropertyBedroom>;
  province: Partial<City>;
  city: Partial<City>;
  region?: Partial<City>;
  property_options: any[];
  _count?: { attachments: number };
  daily_price?: PropertyDailyPrice;
  description?: PropertyDescription;
  property_authorize?: PropertyAuthorize;
  blue_tick?: PropertyBadge;
};

export type PropertyArrayResType = {
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
  today_price: number | null;
  remaining_days: number;
  is_authorized: boolean;
  has_blue_tick: boolean;
  authorize_status: EnumList;
  blue_tick_status: EnumList;
  // rate:number;
};

export type PropertyJsonResType = {
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
};

export type PropertyResType = PropertyArrayResType & PropertyJsonResType;

export class PropertySerializer {
  async toArray(
    data: PropertyJsonType[],
    today: DayColumn,
    isAdvisor: false,
  ): Promise<Array<PropertyArrayResType>> {
    const res: PropertyArrayResType[] = [];
    for (const e of data) {
      res.push({
        ...this.summarize(e, today, true, isAdvisor),
      });
    }

    return res;
  }

  async toJSON(data: PropertyJsonType, today: DayColumn, isAdvisor = false): Promise<PropertyResType> {
    const res = { ...this.summarize(data, today, false, isAdvisor) };
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

  findContactInfo(assistants: PropertyOwnerAssistant[], type: number) {
    switch (type) {
      case 1:
        break;

      default:
        break;
    }
  }

  summarize(data: PropertyJsonType, today: DayColumn, isList: boolean, isAdvisor: boolean): PropertyResType {
    if (!data) return;
    let single: PropertyJsonResType;

    let list: PropertyArrayResType = {
      id: data.id,
      code: data.code,
      title: data.title,
      slug: data.slug,
      feature_image: data.feature_image,
      attachments_count: data._count?.attachments || 0,
      images: data.attachments || [],
      std_capacity: data.std_capacity,
      max_capacity: data.max_capacity,
      total_bedrooms: data.bedrooms?.total_bedrooms || 0,
      bedrooms: data.bedrooms,
      has_pool: data.has_pool,
      province: data.province?.title,
      city: data.city?.title,
      region: data.region?.title,
      advisor_commission: data.advisor_commission,
      today_price: !data.daily_price ? null : data.daily_price['today_offer'] || data.daily_price[today],
      is_authorized: data.is_authorized,
      has_blue_tick: data.has_blue_tick,
      status: PropertyStatusesList.find((_) => _.id === data.status),
      //owner
      remaining_days: moment(data.subscription_expired_at).diff(moment.now(), 'days'),
      authorize_status: data.hasOwnProperty('property_authorize')
        ? PropertyAuthorizeStatusesList.find((e) => e.id === data.property_authorize?.status)
        : null,
      blue_tick_status: data.hasOwnProperty('blue_tick')
        ? PropertyBadgeStatusList.find((e) => e.id === data.blue_tick?.status)
        : null,
    };

    if (!isList)
      single = {
        daily_price: data.daily_price || null,
        latitude: data.lat,
        longitude: data.lng,
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
      };

    let res: PropertyResType = { ...list, ...single };
    return res;
  }
}
