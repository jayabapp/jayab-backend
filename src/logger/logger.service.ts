// logger.service.ts

import { Injectable } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerService {
  constructor() {}

  getLogger(): any {
    return WinstonModule.createLogger({
      transports: [
        new transports.DailyRotateFile({
          level: 'error',
          filename: 'storage/logs/app-%DATE%.log',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: false,
          maxFiles: '14d', // This can be a number of files or number of days.
          maxSize: '20m',
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
            format.printf((data) => {
              return `[${data.timestamp}] [${data.level.toUpperCase()}]: ${data.message}\n`;
            }),
          ),
        }),
        new transports.Console({
          format: format.combine(
            format.cli(),
            format.splat(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf((info) =>
              info.stack && info.stack !== undefined
                ? `[${info.timestamp}] ${info.level}: ${info.message}\n${info?.stack}`
                : `[${info.timestamp}] ${info.level}: ${info.message}`,
            ),
          ),
        }),
      ],
    });
  }
}
