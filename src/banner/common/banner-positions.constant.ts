import { EnumList } from 'src/common/interfaces/model-props.interface';

export enum BannerPosition {
  MAIN_1 = 'main_1',
  MAIN_2 = 'main_2',
  Advisor = 'advisor',
  MAIN_SIDEBAR = 'main_sidebar',
}
export const BannerPositionList: EnumList[] = [
  { id: BannerPosition.MAIN_1, title: 'اصلی - نسبت دو به پنج', hex: '#4f46e5', sub_title: 'بنر اصلی' },
  {
    id: BannerPosition.MAIN_2,
    title: 'وسط صفحه اصلی',
    hex: '#eab308',
    sub_title: 'بنر وسط صفحه اصلی',
  },
  {
    id: BannerPosition.Advisor,
    title: 'مشاوران',
    hex: '#06b6d4',
    sub_title: '',
  },
  // {
  //   id: BannerPosition.MAIN_SIDEBAR,
  //   title: 'سایدبار',
  //   hex: '#E11D48',
  //   sub_title: '',
  // },
  // {
  //   id: BannerPosition.MAIN_BOTTOM,
  //   title: 'بنر پنجم',
  //   hex: '#6366F1',
  //   sub_title: 'بنر پنجم',
  // },
];
