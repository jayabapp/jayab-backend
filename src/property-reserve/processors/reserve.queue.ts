import { Job } from 'bull';
import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { RESERVE_EXPIRE_JOB, RESERVE_QUEUE, RESERVE_SMS_JOB } from './queue-name.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { property } from 'lodash';
import moment from 'moment-jalaali';
import { PropertyReserveUserService } from '../roles/user/user.service';
moment.loadPersian({ dialect: 'persian-modern' });

@Processor(RESERVE_QUEUE)
export class ReserveQueueProcessor {
  constructor(private readonly propertyReserveUserService: PropertyReserveUserService) {}

  @OnQueueCompleted({ name: RESERVE_SMS_JOB })
  async onCompleted(): Promise<void> {
    console.log('On Completed: ', RESERVE_SMS_JOB);
    return;
  }

  @OnQueueFailed({ name: RESERVE_SMS_JOB })
  async onFailed(): Promise<void> {
    console.log('On Failed: ', RESERVE_SMS_JOB);
    return;
  }

  /**
   * send sms job
   * @returns
   */
  @Process(RESERVE_SMS_JOB)
  async sendReserveSms(job: Job<{ reserveId: number }>): Promise<void> {
    console.log(`Job Start: ${RESERVE_SMS_JOB}`);
    await this.propertyReserveUserService.sendReserveSms(job.data.reserveId);
  }

  /**
   * do expire reserve
   * @param job
   */
  @Process(RESERVE_EXPIRE_JOB)
  async expireReserve(job: Job<{ reserveId: number }>): Promise<void> {
    console.log(`Job Start: ${RESERVE_EXPIRE_JOB}`);
    await this.propertyReserveUserService.expireReserve(job.data.reserveId);
  }
}
