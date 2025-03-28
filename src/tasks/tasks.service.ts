import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { promises as fsPromises } from 'fs';
import moment from 'moment-jalaali';
import { AdvisorStatus } from 'src/advisor/common/advisor-status.type';
import { nDaysBeforeNow, nDaysLaterNow, startOfDate, startOfToday } from 'src/common/helpers/date.helper';
import { UserRole } from 'src/common/interfaces/role.enum';
import { STORAGE_EXCEL } from 'src/common/utils/constants/storage-folders';
import { NotificationTypes } from 'src/firebase/constants/notif-types';
import { NotificationSharedService } from 'src/notification/roles/shared/shared.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { SmsService } from 'src/sms/sms.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly db: PrismaService,
    private readonly smsService: SmsService,
    private readonly notificationSharedService: NotificationSharedService,
  ) {}

  /* ---------------------- حذف فایل های اکسل دانلود شده ---------------------- */
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

  /* ------------------------ یادآوری تمدید اشتراک ملک ------------------------ */
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'property-subscription-reminder',
    timeZone: 'Asia/Tehran',
  })
  async propertySubscriptionReminderTask(): Promise<void> {
    console.log(
      `<><><> CRON JOB (property subscription reminder) RAN AT : ${moment().format('HH:MM:ss')} <><><>`,
    );
    const threeDaysLater = nDaysLaterNow(3);
    const today = startOfToday();

    const property = await this.db.property.findFirst({
      where: {
        OR: [{ subscription_expired_at: threeDaysLater }, { subscription_expired_at: today }],
        status: PropertyStatuses.PUBLISHED,
        subscription_reminders: { none: { sent_at: today } },
      },
      select: {
        id: true,
        title: true,
        subscription_expired_at: true,
        owner: { select: { user: { select: { id: true, full_name: true, mobile_number: true } } } },
      },
    });

    console.log({ property, today, threeDaysLater });

    if (property) {
      console.log('property found: ', property.id);
      await this.db.subscriptionReminder.create({
        data: {
          property_id: property.id,
          type: 'sms-notif',
          sent_at: today,
        },
      });
      const days =
        property.subscription_expired_at.getTime() === today.getTime() ? 'امروز' : 'تا سه روز دیگر';

      await this.smsService.sendPropertySubscriptionReminder(
        property.owner.user.mobile_number,
        property.owner.user.full_name,
        property.title,
        days,
      );
      await this.notificationSharedService.createNotification({
        user: { id: property.owner.user.id, role: UserRole.USER },
        mustSendNotif: true,
        notification: {
          title: 'یادآوری تمدید اشتراک ملک',
          body: `ملک ${property.title} تا سه روز دیگر منقضی می شود. لطفا برای تمدید اشتراک اقدام نمایید`,
        },
        notificationType: NotificationTypes.OWNER_PROPERTY,
        notificationableId: property.id.toString(),
      });
    }

    try {
    } catch (error) {
      throw new Error(`Unable to read files: ${error.message}`);
    }
  }

  /* -------------------- یادآوری تمدید اشتراک اکانت مشاور -------------------- */
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'advisor-subscription-remider',
    timeZone: 'Asia/Tehran',
  })
  async advisorSubscriptionReminderTask(): Promise<void> {
    console.log(
      `<><><> CRON JOB (advisor subscription remider) RAN AT : ${moment().format('HH:MM:ss')} <><><>`,
    );
    const threeDaysLater = nDaysLaterNow(3);
    const today = startOfToday();

    const advisor = await this.db.advisor.findFirst({
      where: {
        OR: [{ subscription_expired_at: threeDaysLater }, { subscription_expired_at: today }],
        status: AdvisorStatus.APPROVED,
        subscription_reminders: { none: { created_at: today } },
      },
      select: {
        id: true,
        subscription_expired_at: true,
        user: { select: { id: true, full_name: true, mobile_number: true } },
      },
    });

    console.log({ advisor, today, threeDaysLater });

    if (advisor) {
      console.log('advisor found: ', advisor.id);
      await this.db.subscriptionReminder.create({
        data: {
          advisor_id: advisor.id,
          type: 'sms-notif',
        },
      });
      const days = advisor.subscription_expired_at.getTime() === today.getTime() ? 'امروز' : 'تا سه روز دیگر';
      await this.smsService.sendAdvisorSubscriptionReminder(
        advisor.user.mobile_number,
        advisor.user.full_name,
        days,
      );
      await this.notificationSharedService.createNotification({
        user: { id: advisor.user.id, role: UserRole.USER },
        mustSendNotif: true,
        notification: {
          title: 'یادآوری تمدید اشتراک اکانت مشاور',
          body: `اکانت مشاور  شماه تا سه روز دیگر منقضی می شود. لطفا برای تمدید اشتراک اقدام نمایید`,
        },
        notificationType: NotificationTypes.ADVISOR_SUBSCRIPTION,
        notificationableId: '',
      });
    }

    try {
    } catch (error) {
      throw new Error(`Unable to read files: ${error.message}`);
    }
  }
}
