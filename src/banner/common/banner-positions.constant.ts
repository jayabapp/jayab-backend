import { EnumList } from 'src/common/interfaces/model-props.interface';

export enum BannerPosition {
  MAIN_1 = 'main_1',
  MAIN_2 = 'main_2',
  MAIN_3 = 'main_3',
  ROOMS_1 = 'rooms_1',
  Advisor = 'advisor',
}
export const BannerPositionList: EnumList[] = [
  { id: BannerPosition.MAIN_1, title: 'بالای صفحه اصلی', hex: '#4f46e5', sub_title: 'بنر اصلی' },
  {
    id: BannerPosition.MAIN_2,
    title: 'بین آگهی ها - صفحه اصلی',
    hex: '#eab308',
    sub_title: 'بین آگهی ها - صفحه اصلی',
  },
  {
    id: BannerPosition.MAIN_3,
    title: 'پایین صفحه اصلی',
    hex: '#1af308',
    sub_title: 'پایین صفحه اصلی',
  },
  {
    id: BannerPosition.ROOMS_1,
    title: 'بین آگهی ها - عادی',
    hex: '#6366F1',
    sub_title: 'بین آگهی ها - عادی',
  },
  {
    id: BannerPosition.Advisor,
    title: 'مشاوران',
    hex: '#06b6d4',
    sub_title: '',
  },
];
