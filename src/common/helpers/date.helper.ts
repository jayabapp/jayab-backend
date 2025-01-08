import moment from 'moment-jalaali';
import { JalaaliDateDto } from '../dto/jalaali-date.dto';
import { JALAALI_FORMAT } from '../utils/constants/date.constant';

export function startOfToday(): Date {
  const date = new Date(moment().format('YYYY-MM-DD')); // 2023-11-12T00:00:00.000Z
  return date;
}

export function startOfDate(date: Date): Date {
  return new Date(moment(date).format('YYYY-MM-DD')); // 2023-11-12T00:00:00.000Z
}

export function endOfDate(date: Date): Date {
  return new Date(moment(date).set({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DDTHH:mm:ss')); // 2023-11-12T23:59:59.000Z
}

export function nDaysLaterNow(days: number): Date {
  if (days < 0) days = 0;
  const date = new Date(moment().add(days, 'day').format('YYYY-MM-DD')); // 2023-11-12T00:00:00.000Z

  return date;
}

export function nDaysLaterDate(date: Date, days: number): Date {
  if (days < 0) days = 0;
  return new Date(moment(date).add(days, 'day').format('YYYY-MM-DD')); // 2023-11-12T00:00:00.000Z
}

export function nDaysBeforeNow(days: number): Date {
  if (days < 0) days = 0;
  const date = new Date(moment().add(-days, 'day').format('YYYY-MM-DD')); // 2023-11-12T00:00:00.000Z

  return date;
}

export function nMonthsLaterNow(months: number): Date {
  if (months < 0) months = 0;
  const date = new Date(moment().add(months, 'month').format('YYYY-MM-DD')); // 2023-11-12T00:00:00.000Z

  return date;
}

export function nowDayNumber(): number {
  return moment().day();
}

export function nowDate(): Date {
  return new Date();
}

export function convertJalaaliDtoToDate(dto: JalaaliDateDto): Date {
  const jdate = `${dto.year}/${dto.month}/${dto.day}`;
  const date = startOfDate(moment(jdate, JALAALI_FORMAT).toDate());
  return date;
}

export function convertGeorgianToJalaali(date: Date): string {
  const gregorianDate = moment(date);
  const persianDate = gregorianDate.format('jYYYY/jMM/jDD');
  return persianDate;
}
