import { nDaysLaterDate, startOfToday } from './date.helper';
import { Global, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { countBy } from 'lodash';
import { DayDto } from 'src/property/roles/owner/dto/update-property.dto';
import { Cache } from 'cache-manager';

import moment from 'moment-jalaali';

export enum DayColumn {
  normal = 'normal',
  wednesday = 'wednesday',
  thursday = 'thursday',
  friday = 'friday',
  peak = 'peak',
}

export function toDayKey(date: Date): string {
  return moment(date).format('YYYY-MM-DD');
}

export function resolveWeekdayColumn(date: Date): DayColumn {
  switch (moment(date).isoWeekday()) {
    case 3:
      return DayColumn.wednesday;
    case 4:
      return DayColumn.thursday;
    case 5:
      return DayColumn.friday;
    default:
      return DayColumn.normal;
  }
}

export function resolveDayColumn(date: Date, peakDayKeys: Set<string>): DayColumn {
  return peakDayKeys.has(toDayKey(date)) ? DayColumn.peak : resolveWeekdayColumn(date);
}

@Global()
@Injectable()
export class DayHelper {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly db: PrismaService,
  ) {}

  /**
   * Find today column for use in daily and hourly price table
   * @returns
   */
  public async today(): Promise<DayColumn> {
    if (await this.findPeak(this.todayUnix())) return DayColumn.peak;
    return resolveWeekdayColumn(startOfToday());
  }

  public async daysRange(
    startDate: Date,
    duration: number,
  ): Promise<{ requestedDays: DayColumn[]; daysCount: object }> {
    const columns: DayColumn[] = [];

    for (let i = 0; i < duration; i++) {
      const day = moment(nDaysLaterDate(startDate, i));
      const dayUnix = day.unix();
      if (await this.findPeak(dayUnix)) {
        columns.push(DayColumn.peak);
        continue;
      }
      columns.push(resolveWeekdayColumn(day.toDate()));
    }
    const obj = {
      requestedDays: columns,
      daysCount: countBy(columns),
    };

    return obj;
  }

  todayUnix = (): number => {
    return moment(startOfToday()).unix();
  };

  tsToJalaliObject = (timestamp: number): DayDto => {
    return {
      day: +moment.unix(timestamp).format('jDD'),
      month: +moment.unix(timestamp).format('jMM'),
      year: moment.unix(timestamp).jYear(),
    };
  };

  async findPeak(unix: number) {
    const inCache = await this.cacheManager.get(`peak-${unix}`);
    if (inCache == '1') return true;
    if (inCache == '0') return false;
    const isPeak = await this.db.peakDay.findFirst({ where: { timestamp: unix } });
    if (isPeak) {
      await this.cacheManager.set(`peak-${unix}`, '1', 2 * 60 * 60);
      return true;
    }
    await this.cacheManager.set(`peak-${unix}`, '0', 2 * 60 * 60);
    return false;
  }
}
