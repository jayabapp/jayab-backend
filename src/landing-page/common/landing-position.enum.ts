import { EnumList } from 'src/common/interfaces/model-props.interface';

export enum LandingPagePosition {
  POPULAR_CITY = 'popular_city',
  QUICK_SEARCH = 'quick_search',
}

export const LandingPagePositionList: EnumList[] = [
  { id: LandingPagePosition.POPULAR_CITY, title: 'شهرهای پربازدید', hex: '#f59e0b' },
  { id: LandingPagePosition.QUICK_SEARCH, title: 'جستجوی سریع', hex: '#14b8a6' },
];
