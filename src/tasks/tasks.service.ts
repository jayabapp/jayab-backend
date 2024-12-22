import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { promises as fsPromises } from 'fs';
import moment from 'moment-jalaali';
import { STORAGE_EXCEL } from 'src/common/utils/constants/storage-folders';

//DEPRECATED FOR BANK BRIDGE USAGE
@Injectable()
export class TasksService {
  @Cron(CronExpression.EVERY_30_MINUTES, {
    name: 'delete-excel-files',
    timeZone: 'Asia/Tehran',
  })
  async removeDownloadedExcelTask(): Promise<void> {
    const now = moment();
    console.log(`<><><> CRON JOB RAN AT : ${now.format('HH:MM:ss')} <><><>`);

    try {
      const files = await fsPromises.readdir(STORAGE_EXCEL);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `${STORAGE_EXCEL}/${file}`;

        const stats = await fsPromises.stat(filePath);

        if (moment().diff(moment(stats.mtime), 'm') > 5) await fsPromises.unlink(filePath);
      }
    } catch (error) {
      throw new Error(`Unable to read files: ${error.message}`);
    }
  }
}
