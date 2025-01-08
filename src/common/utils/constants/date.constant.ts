import { range } from 'lodash';
import moment from 'moment-jalaali';

export const JALAALI_FORMAT = 'jYYYY/jMM/jDD';
export const JALAALI_FORMAT_MIN_MONTH = 'jYYYY/jM/jDD';

export const JALAALI_MONTHS = [
  { id: 1, title: 'فروردین' },
  { id: 2, title: 'اردیبهشت' },
  { id: 3, title: 'خرداد' },
  { id: 4, title: 'تیر' },
  { id: 5, title: ' مرداد' },
  { id: 6, title: 'شهریور' },
  { id: 7, title: 'مهر' },
  { id: 8, title: 'آبان' },
  { id: 9, title: 'آذر' },
  { id: 10, title: 'دی' },
  { id: 11, title: 'بهمن' },
  { id: 12, title: 'اسفند' },
];

export const JALAALI_YEARS = (start?: number, end?: number) =>
  range(start || moment().jYear(), end || moment().jYear() + 10).map((e) => ({ id: e, title: e }));

export const JALAALI_DAYS = range(1, 31).map((e) => ({ id: e, title: e }));
