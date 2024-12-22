import { EnumList } from 'src/common/interfaces/model-props.interface';

export enum BannerPosition {
  MAIN = 'MAIN',
  MAIN_MIDDLE = 'MAIN_MIDDLE',
  MAIN_BOTTOM = 'MAIN_BOTTOM',
  POS1 = 'POS1',
  // POS2 = 'POS2',
}
export const BannerPositionList: EnumList[] = [
  { id: BannerPosition.MAIN, title: 'اصلی - نسبت یک به چهار', hex: '#4f46e5', sub_title: 'بنر اصلی' },
  {
    id: BannerPosition.MAIN_MIDDLE,
    title: 'وسط صفحه اصلی - مربع',
    hex: '#eab308',
    sub_title: 'بنر وسط صفحه اصلی',
  },
  {
    id: BannerPosition.MAIN_BOTTOM,
    title: 'پایین صفحه اصلی - نسبت یک به چهار',
    hex: '#06b6d4',
    sub_title: 'بنر پایین صفحه اصلی',
  },
  {
    id: BannerPosition.POS1,
    title: 'بنر چهارم',
    hex: '#E11D48',
    sub_title: 'بنر چهارم',
  },
  // {
  //   id: BannerPosition.MAIN_BOTTOM,
  //   title: 'بنر پنجم',
  //   hex: '#6366F1',
  //   sub_title: 'بنر پنجم',
  // },
];
