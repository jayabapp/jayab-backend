import { Job } from 'bull';
import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { PAYMENT_SMS_JOB, PAYMENT_SMS_QUEUE } from './queue-name.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { SmsService } from 'src/sms/sms.service';

@Processor(PAYMENT_SMS_QUEUE)
export class PaymentSmsQueueProcessor {
  constructor(
    private readonly db: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                     SMS                                    */
  /* -------------------------------------------------------------------------- */
  @OnQueueCompleted({ name: PAYMENT_SMS_JOB })
  async onCompleted(): Promise<void> {
    console.log('On Completed: ', PAYMENT_SMS_JOB);
    return;
  }

  @OnQueueFailed({ name: PAYMENT_SMS_JOB })
  async onFailed(): Promise<void> {
    console.log('On Failed: ', PAYMENT_SMS_JOB);
    return;
  }

  /**
   * save call log
   * @returns
   */
  @Process(PAYMENT_SMS_JOB)
  async sendSms(job: Job<{ propertyId: number }>): Promise<void> {
    console.log(`Job Start: ${PAYMENT_SMS_JOB}`);

    const { propertyId } = job.data;
    const reserves = await this.db.propertyReserve.findMany({
      where: { property_id: propertyId, expired_at: null, canceled_at: null },
      select: { user: { select: { mobile_number: true } } },
    });
    console.log({ reserves });

    const p = await this.db.property.findFirst({ where: { id: propertyId }, select: { title: true } });

    for (const r of reserves) {
      await this.smsService.sendPropertyReserveHintToGuest(r.user.mobile_number, p.title);
    }
    return;
  }
}
