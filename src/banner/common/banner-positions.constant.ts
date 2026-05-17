import { EnumList } from 'src/common/interfaces/model-props.interface';

export enum BannerPosition {
  MAIN_1 = 'main_1',
  MAIN_2 = 'main_2',
  MAIN_3 = 'main_3',
  Advisor = 'advisor',
}
export const BannerPositionList: EnumList[] = [
  { id: BannerPosition.MAIN_1, title: 'بالای صفحه اصلی', hex: '#4f46e5', sub_title: 'بنر اصلی' },
  {
    id: BannerPosition.MAIN_2,
    title: 'تبلیغات بین آگهی',
    hex: '#eab308',
    sub_title: 'تبلیغات بین آگهی',
  },
  {
    id: BannerPosition.MAIN_3,
    title: 'پایین صفحه اصلی',
    hex: '#1af308',
    sub_title: 'پایین صفحه اصلی',
  },
  {
    id: BannerPosition.Advisor,
    title: 'مشاوران',
    hex: '#06b6d4',
    sub_title: '',
  },
];
