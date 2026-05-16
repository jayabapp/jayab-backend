import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import moment from 'moment-jalaali';
import { PrismaService } from 'src/prisma/prisma.service';
import { SmsService } from 'src/sms/sms.service';
import { PAYMENT_SMS_JOB, PAYMENT_SMS_QUEUE } from './queue-name.constants';

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

    //اول برای درخواست های منقضی نشده میفرستادیم. در ۲۶ اردیبهشت ۴۰۵ درخواست شد که برای درخواست های یک ساعت پیش ارسال بشه
    const reserves = await this.db.propertyReserve.findMany({
      where: {
        property_id: propertyId,
        canceled_at: null,
        created_at: { gte: moment().subtract(1, 'hours').toDate() },
      },
      select: { user: { select: { mobile_number: true } } },
    });

    // console.log({ reserves });

    const p = await this.db.property.findFirst({ where: { id: propertyId }, select: { title: true } });

    for (const r of reserves) {
      await this.smsService.sendPropertyReserveHintToGuest(r.user.mobile_number, p.title);
    }
    return;
  }
}
