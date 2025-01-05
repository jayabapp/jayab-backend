import {
  Attachment,
  City,
  Property,
  PropertyBedroom,
  PropertyDailyPrice,
  PropertyOption,
} from '@prisma/client';
import { EnumList } from 'src/common/interfaces/model-props.interface';
import { PropertyStatuses, PropertyStatusesList } from '../common/types/property-status.type';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';
import { DayColumn } from 'src/common/helpers/day.helper';

export type PropertyJsonType = Property & {
  feature_image?: Attachment;
  bedrooms: PropertyBedroom;
  province: City;
  city: City;
  region?: City;
  property_options: PropertyOption[];
  _count: { attachments: number };
  daily_price: PropertyDailyPrice;
};

export type PropertyResType = {
  id: number;
  code: string;
  title: string;
  std_capacity: number;
  max_capacity: number;
  total_bedrooms: number;
  has_pool: boolean;
  feature_image: Attachment;
  province: string;
  city: string;
  region: string;
  status: EnumList;
  advisor_commission: number;
  options: object[];
  attachments_count: number;
  today_price: number | null;
  // rate:number;
};

export class PropertySerializer {
  async toArray(
    data: PropertyJsonType[],
    today: DayColumn,
    isAdvisor: false,
  ): Promise<Array<PropertyResType>> {
    const res: PropertyResType[] = [];
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

  summarize(data: PropertyJsonType, today: DayColumn, isArray: boolean, isAdvisor: boolean): PropertyResType {
    const isDeleted = !!data?.deleted_at;

    const res: PropertyResType = {
      id: data.id,
      code: data.code,
      title: data.title,
      feature_image: data.feature_image,
      attachments_count: data._count.attachments,
      std_capacity: data.std_capacity,
      max_capacity: data.max_capacity,
      total_bedrooms: data.bedrooms?.total_bedrooms || 0,
      has_pool: data.has_pool,
      province: data.province?.title,
      city: data.city?.title,
      region: data.region?.title,
      advisor_commission: data.advisor_commission,
      options: !isArray ? this.formatPropertyOptions(data.property_options, 'title') : [],
      today_price: !data.daily_price ? null : data.daily_price['today_offer'] || data.daily_price[today],
      status: PropertyStatusesList.find((_) => _.id === data.status),
      // authorize_status: !data.hasOwnProperty('property_authorize') ? '' : this.findAuthStatus(e.property_authorize),
    };

    return res;
  }
}
