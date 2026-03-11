import { Job } from 'bull';
import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { RESERVE_QUEUE, RESERVE_SMS_JOB } from './queue-name.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { property } from 'lodash';

@Processor(RESERVE_QUEUE)
export class ReserveQueueProcessor {
  constructor(private readonly db: PrismaService) {}

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
   * implement job
   * @returns
   */
  @Process(RESERVE_SMS_JOB)
  async sendReserveSms(job: Job<{ reserveId: number }>): Promise<void> {
    console.log(`Job Start: ${RESERVE_SMS_JOB}`);
    const { reserveId } = job.data;
    const reserve = await this.db.propertyReserve.findFirst({
      where: { id: reserveId },
      include: { property: { select: { title: true } }, user: { select: { mobile_number: true } } },
    });
    if (!reserve) throw new NotFoundException('NOT_FOUND');

    const p = reserve.property;
    const u = reserve.user;

    const title = `"${p.title.substring(0, 38)}"`;
    const userMobile = u.mobile_number;
    // const date = `${}`
    const duration = 1;
    const guestsText = '';
  }
}
