import { EnumList } from 'src/common/interfaces/model-props.interface';

/** COLORS LIST
 *
 * #0ea5e9
 * #eab308
 * #84cc16
 * #14b8a6
 * #be123c
 * #f97316
 * #9333ea
 * #3b82f6
 * #22c55e
 * #ec4899
 * #f43f5e
 * #f59e0b
 * #10b981
 * #6366f1
 * #22d3ee
 */

export enum PropertyOptionGroup {
  PROPERTY_TYPE = 'PROPERTY_TYPE', //نوع ملک
  OWNERSHIP = 'OWNERSHIP', //نوع مالکیت
  PATTERN = 'PATTERN', //بافت محیط
  ACCESS = 'ACCESS', // مسیر دسترسی
  NEIGHBORHOOD = 'NEIGHBORHOOD', //همسایگی
  ENTERTAINMENT = 'ENTERTAINMENT', //امکانات تفریحی
  POOL_TYPE = 'POOL_TYPE', //نوع استخر
  KITCHEN = 'KITCHEN', //امکانات آشپزخانه
  COOL_HEAT = 'COOL_HEAT', //امکانات سرمایشی و گرمایشی
  WELFARE = 'WELFARE', //رفاهی
  GUEST_TYPE = 'GUEST_TYPE', //نوع مهمان
  PET = 'PET', // شرایط ورود حیوان خانگی
  PARTY = 'PARTY', // شرایط برگزاری مراسم
  BUILDING_DIRECTION = 'BUILDING_DIRECTION', //جهت ساختمان
  OWNERSHIP_TYPE = 'OWNERSHIP_TYPE', //نوع مالکیت
}

export const PropertyOptionGroupList: Array<EnumList> = [
  {
    id: PropertyOptionGroup.PROPERTY_TYPE,
    title: 'نوع ملک',
    hex: '#0ea5e9',
  },
  {
    id: PropertyOptionGroup.OWNERSHIP,
    title: 'نوع مالکیت',
    hex: '#eab308',
  },
  {
    id: PropertyOptionGroup.PATTERN,
    title: 'بافت محیط',
    hex: '#84cc16',
  },
  {
    id: PropertyOptionGroup.ACCESS,
    title: 'مسیر دسترسی',
    hex: '#14b8a6',
  },
  {
    id: PropertyOptionGroup.NEIGHBORHOOD,
    title: 'همسایگی',
    hex: '#a6b25c',
  },
  {
    id: PropertyOptionGroup.ENTERTAINMENT,
    title: 'امکانات تفریحی',
    hex: '#f97316',
  },
  {
    id: PropertyOptionGroup.POOL_TYPE,
    title: 'نوع استخر',
    hex: '#9333ea',
  },
  {
    id: PropertyOptionGroup.KITCHEN,
    title: 'امکانات آشپزخانه',
    hex: '#3b82f6',
  },
  {
    id: PropertyOptionGroup.COOL_HEAT,
    title: 'امکانات سرمایشی و گرمایشی',
    hex: '#22c55e',
  },
  {
    id: PropertyOptionGroup.WELFARE,
    title: 'رفاهی',
    hex: '#ec4899',
  },
  {
    id: PropertyOptionGroup.GUEST_TYPE,
    title: 'نوع مهمان',
    hex: '#f43f5e',
  },
  {
    id: PropertyOptionGroup.PET,
    title: 'شرایط ورود حیوان خانگی',
    hex: '#f59e0b',
  },
  {
    id: PropertyOptionGroup.PARTY,
    title: 'شرایط برگزاری مراسم',
    hex: '#10b981',
  },
  {
    id: PropertyOptionGroup.BUILDING_DIRECTION,
    title: 'جهت ساختمان',
    hex: '#6366f1',
  },
  {
    id: PropertyOptionGroup.OWNERSHIP_TYPE,
    title: 'نوع مالکیت',
    hex: '#22d3ee',
  },
];
