import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';

export const PropertyOptionGroupLabels = new Map<string, string>([
  [PropertyOptionGroup.PROPERTY_TYPE, 'نوع ملک'],
  [PropertyOptionGroup.OWNERSHIP, 'نوع مالکیت'],
  [PropertyOptionGroup.PATTERN, 'بافت محیط'],
  [PropertyOptionGroup.ACCESS, 'مسیر دسترسی'],
  [PropertyOptionGroup.NEIGHBORHOOD, 'همسایگی'],
  [PropertyOptionGroup.ENTERTAINMENT, 'امکانات تفریحی'],
  [PropertyOptionGroup.POOL_TYPE, 'نوع استخر'],
  [PropertyOptionGroup.KITCHEN, 'امکانات آشپزخانه'],
  [PropertyOptionGroup.COOL_HEAT, 'امکانات سرمایشی و گرمایشی'],
  [PropertyOptionGroup.WELFARE, 'رفاهی'],
  [PropertyOptionGroup.GUEST_TYPE, 'نوع مهمان'],
  [PropertyOptionGroup.PET, 'شرایط ورود حیوان خانگی'],
  [PropertyOptionGroup.PARTY, 'شرایط برگزاری مراسم'],
  [PropertyOptionGroup.BUILDING_DIRECTION, 'جهت ساختمان'],
]);
