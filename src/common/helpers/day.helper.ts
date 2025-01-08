import { Global, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { countBy, groupBy } from 'lodash';
import moment from 'moment-jalaali';

import { DateTime } from 'luxon';
DateTime.fromObject({}, { zone: 'Asia/Tehran' });

import { Cache } from 'cache-manager';
import { DayDto } from 'src/property/roles/owner/dto/update-property.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { nDaysLaterDate, startOfDate, startOfToday } from './date.helper';

export enum DayColumn {
  normal = 'normal',
  wednesday = 'wednesday',
  thursday = 'thursday',
  friday = 'friday',
  peak = 'peak',
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
    const today: number = moment(startOfToday()).weekday();

    if (await this.findPeak(this.todayUnix())) return DayColumn.peak;

    let column: DayColumn;
    switch (today) {
      case 3:
        column = DayColumn.wednesday;
        break;
      case 4:
        column = DayColumn.thursday;
        break;
      case 5:
        column = DayColumn.friday;
        break;

      default:
        column = DayColumn.normal;
        break;
    }
    // console.log(column);

    return column;
  }

  public async daysRange(
    startDate: Date,
    duration: number,
  ): Promise<{ requestedDays: DayColumn[]; daysCount: object }> {
    let columns: DayColumn[] = [];

    for (let i = 0; i < duration; i++) {
      const day = moment(nDaysLaterDate(startDate, i));
      const dayUnix = day.unix();

      if (await this.findPeak(dayUnix)) {
        columns.push(DayColumn.peak);
        continue;
      }
      const dayNumber: number = day.weekday();

      let column: DayColumn;
      switch (dayNumber) {
        case 3:
          column = DayColumn.wednesday;
          break;
        case 4:
          column = DayColumn.thursday;
          break;
        case 5:
          column = DayColumn.friday;
          break;

        default:
          column = DayColumn.normal;
          break;
      }
      // console.log(column);
      columns.push(column);
    }
    const obj = {
      requestedDays: columns,
      daysCount: countBy(columns),
    };

    return obj;
  }

  todayUnix = (): number => {
    // return moment().startOf('day').unix();
    return DateTime.now().startOf('day').toUnixInteger();
  };

  dayUnix = (date: DayDto, duration = 0): number => {
    const jDate = `${date.year}/${date.month}/${date.day}`;
    let gerogian = moment(jDate, 'jYYYY/jMM/jDD').toDate();

    const dayUnix = DateTime.fromJSDate(gerogian).plus({ day: duration }).toUnixInteger();
    return dayUnix;
  };

  dayUnixByUnix = (timestamp: number, duration = 0): number => {
    const dayUnix = DateTime.fromSeconds(Math.trunc(timestamp)).plus({ day: duration }).toUnixInteger();
    return dayUnix;
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
    // console.log('today in cache', inCache);

    if (inCache == '1') return true;
    if (inCache == '0') return false;

    const isPeak = false; //await this.db.peakDay.findFirst({ where: { timestamp: unix } });//TODO
    if (isPeak) {
      // console.log('is peak');

      await this.cacheManager.set(`peak-${unix}`, '1', 2 * 60 * 60);
      return true;
    }
    await this.cacheManager.set(`peak-${unix}`, '0', 2 * 60 * 60);
    return false;
  }
}
