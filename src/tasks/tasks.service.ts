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
import { PageSeoAnalyzeAdminService } from 'src/page-seo-analyze/roles/admin/admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { SettingKey } from 'src/setting/common/interfaces/settings.interface';
import { SettingAdminService } from 'src/setting/roles/admin/admin.service';
import { SmsService } from 'src/sms/sms.service';

@Injectable()
export class TasksService {
  IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production';

  constructor(
    private readonly db: PrismaService,
    private readonly smsService: SmsService,
    private readonly notificationSharedService: NotificationSharedService,
    private readonly settingService: SettingAdminService,
    private readonly pageSeoAnalyzeAdminService: PageSeoAnalyzeAdminService,
  ) {}

  /* ---------------------- حذف فایل های اکسل دانلود شده ---------------------- */
  @Cron(CronExpression.EVERY_30_MINUTES, {
    name: 'delete-excel-files',
    timeZone: 'Asia/Tehran',
  })
  async removeDownloadedExcelTask(): Promise<void> {
    if (!this.IS_PRODUCTION) return;
    const now = moment().format('YYYY-MM-DD HH:mm');
    console.log(`🕑 cron:delete-excel-files : ${now}`);

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
    if (!this.IS_PRODUCTION) return;
    const hour = moment().hour();
    if (hour < 10 || hour > 14) return;

    const now = moment().format('YYYY-MM-DD HH:mm');
    console.log(`🕑 cron:property-subscription-reminder : ${now}`);

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

    // console.log({ property, today, threeDaysLater });

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
          body: `ملک ${property.title} ${days} منقضی می شود. لطفا برای تمدید اشتراک اقدام نمایید`,
        },
        notificationType: NotificationTypes.OWNER_PROPERTY,
        notificationableId: property.id.toString(),
      });
    }
  }

  /* -------------------- یادآوری تمدید اشتراک اکانت مشاور -------------------- */
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'advisor-subscription-reminder',
    timeZone: 'Asia/Tehran',
  })
  async advisorSubscriptionReminderTask(): Promise<void> {
    if (!this.IS_PRODUCTION) return;
    const hour = moment().hour();
    if (hour < 10 || hour > 14) return;

    const now = moment().format('YYYY-MM-DD HH:mm');
    console.log(`🕑 cron:advisor-subscription-reminder : ${now}`);

    const threeDaysLater = nDaysLaterNow(3);
    const today = startOfToday();

    const advisor = await this.db.advisor.findFirst({
      where: {
        OR: [{ subscription_expired_at: threeDaysLater }, { subscription_expired_at: today }],
        status: AdvisorStatus.APPROVED,
        subscription_reminders: { none: { sent_at: today } },
      },
      select: {
        id: true,
        subscription_expired_at: true,
        user: { select: { id: true, full_name: true, mobile_number: true } },
      },
    });

    // console.log({ advisor, today, threeDaysLater });

    if (advisor) {
      console.log('advisor found: ', advisor.id);
      await this.db.subscriptionReminder.create({
        data: {
          advisor_id: advisor.id,
          type: 'sms-notif',
          sent_at: today,
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
  }

  /* ------------------------ حذف نردبان های منقضی شده ------------------------ */
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'property-promote-remover',
    timeZone: 'Asia/Tehran',
  })
  async removeExpiredPromoteOnProperty(): Promise<void> {
    if (!this.IS_PRODUCTION) return;
    const now = moment().format('YYYY-MM-DD HH:mm');
    console.log(`🕑 cron:property-promote : ${now}`);

    const duration = await this.settingService.get(SettingKey.PROPERTY_PROMOTE_DURATION);
    if (!duration || isNaN(duration)) return;

    const lastOkDate = moment().subtract(+duration, 'days').toDate();
    if (!lastOkDate) return;

    const property = await this.db.property.findFirst({
      where: { promoted_at: { lt: lastOkDate } },
      select: { id: true },
    });

    if (property) await this.db.property.update({ where: { id: property.id }, data: { promoted_at: null } });
  }

  /* --------------------- enable chat in expired property -------------------- */
  @Cron(CronExpression.EVERY_6_HOURS, {
    name: 'enable-chat-in-expired-property',
    timeZone: 'Asia/Tehran',
  })
  async enableChatInExpiredProperty(): Promise<void> {
    if (!this.IS_PRODUCTION) return;

    const now = moment();
    console.log(`⏱️ cron:enable chat in expired property:${now.format('HH:MM:ss')}`);
    await this.db.property.updateMany({
      where: { subscription_expired_at: { lt: new Date() }, is_chat_enabled: false },
      data: { is_chat_enabled: true },
    });
  }

  /* ----------------------------------- seo ---------------------------------- */
  @Cron(CronExpression.EVERY_10_SECONDS, {
    name: 'seo-page-analyze',
    timeZone: 'Asia/Tehran',
  })
  async seoPageAnalyze(): Promise<void> {
    if (!this.IS_PRODUCTION) return;

    const now = moment();
    console.log(`⏱️ cron:page analyze:${now.format('HH:MM:ss')}`);
    await this.pageSeoAnalyzeAdminService.scrapAndCreateReport();
  }

  /**
   * رکوردهای جدول رو با سایت مپ چک میکنه و موارد اضافه شده در سایت مپ رو میریزه توی جدول
   */
  @Cron(CronExpression.EVERY_6_HOURS, {
    name: 'sync-seo-page-analyze-and-sitemap',
    timeZone: 'Asia/Tehran',
  })
  async synSeoPageAnalyzeAndSitemap(): Promise<void> {
    if (!this.IS_PRODUCTION) return;

    const now = moment();
    console.log(`⏱️ cron:sync page analyze and sitemap:${now.format('HH:MM:ss')}`);
    await this.pageSeoAnalyzeAdminService.syncSitemap();
  }
}
