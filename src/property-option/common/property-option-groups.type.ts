import { EnumList } from 'src/common/interfaces/model-props.interface';

/** COLORS LIST
 *
 * #0ea5e9
 * #eab308
 * #84cc16
 * #14b8a6
 * #be123c
 * #f97316
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
}
