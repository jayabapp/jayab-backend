import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly isProduction: boolean;

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  async sendVerificationCode(mobile: string, code: string): Promise<void> {
    try {
      if (!this.isProduction) return;

      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.verificationTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      const body = {
        parameters: [{ name: 'VerificationCode', value: code }],
        mobile: mobile,
        templateId: templateId,
      };

      await firstValueFrom(
        this.httpService.post(sendUrl, body, {
          headers: { 'X-API-KEY': apiToken, ACCEPT: 'application/json' },
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  async sendChangePropertyStatusToOwner(
    mobile: string,
    propertyTitle: string,
    status: string,
  ): Promise<void> {
    try {
      if (!this.isProduction) return;

      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.propertyStatusTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      const body = {
        parameters: [
          { name: 'Title', value: propertyTitle },
          { name: 'Status', value: status },
        ],
        mobile: mobile,
        templateId: templateId,
      };

      await firstValueFrom(
        this.httpService.post(sendUrl, body, {
          headers: { 'X-API-KEY': apiToken, ACCEPT: 'application/json' },
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  async sendChangePropertyAuthStatusToOwner(
    mobile: string,
    propertyTitle: string,
    status: string,
  ): Promise<void> {
    try {
      if (!this.isProduction) return;

      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.propertyAuthStatusTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      const body = {
        parameters: [
          { name: 'Title', value: propertyTitle },
          { name: 'Status', value: status },
        ],
        mobile: mobile,
        templateId: templateId,
      };

      await firstValueFrom(
        this.httpService.post(sendUrl, body, {
          headers: { 'X-API-KEY': apiToken, ACCEPT: 'application/json' },
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  async sendPropertySubscriptionReminder(
    mobile: string,
    fullName: string,
    propertyTitle: string,
    days: string,
  ): Promise<void> {
    if (!this.isProduction) return;

    try {
      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.propertySubscriptionReminderTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      const body = {
        parameters: [
          { name: 'Name', value: fullName },
          { name: 'Title', value: propertyTitle },
          { name: 'Days', value: days },
        ],
        mobile: mobile,
        templateId: templateId,
      };

      await firstValueFrom(
        this.httpService.post(sendUrl, body, {
          headers: { 'X-API-KEY': apiToken, ACCEPT: 'application/json' },
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }
  async sendAdvisorSubscriptionReminder(mobile: string, fullName: string, days: string): Promise<void> {
    if (!this.isProduction) return;

    try {
      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.advisorSubscriptionReminderTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      const body = {
        parameters: [
          { name: 'Name', value: fullName },
          { name: 'Days', value: days },
        ],
        mobile: mobile,
        templateId: templateId,
      };

      await firstValueFrom(
        this.httpService.post(sendUrl, body, {
          headers: { 'X-API-KEY': apiToken, ACCEPT: 'application/json' },
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  async sendPromoteSmsToOwner(mobile: string, fullName: string): Promise<void> {
    if (!this.isProduction) return;

    try {
      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.propertyPromoteTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      const body = {
        parameters: [{ name: 'FULLNAME', value: fullName }],
        mobile: mobile,
        templateId: templateId,
      };

      await firstValueFrom(
        this.httpService.post(sendUrl, body, {
          headers: { 'X-API-KEY': apiToken, ACCEPT: 'application/json' },
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * ارسال پیامک به مالک وقتی کاربر روی تماس کلیک میکنه
   * @param mobile
   * @param ownerMobile
   * @returns
   */
  async sendCallLogToOwner(mobile: string, targetUserMobile: string): Promise<void> {
    if (!this.isProduction) return;

    try {
      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.callLogTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      const body = {
        parameters: [{ name: 'MOBILE', value: targetUserMobile }],
        mobile: mobile,
        templateId: templateId,
      };

      await firstValueFrom(
        this.httpService.post(sendUrl, body, {
          headers: { 'X-API-KEY': apiToken, ACCEPT: 'application/json' },
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  async sendReserveToOwner(
    ownerMobile: string,
    title: string,
    guestMobile: string,
    date: string,
    duration: string,
    guestsCount: string,
  ): Promise<void> {
    if (!this.isProduction) return;

    try {
      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.reserveSmsTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      const body = {
        parameters: [
          { name: 'TITLE', value: title },
          { name: 'PHONE', value: guestMobile },
          { name: 'DATE', value: date },
          { name: 'DURATION', value: duration },
          { name: 'GUESTS', value: guestsCount },
        ],
        mobile: ownerMobile,
        templateId: templateId,
      };

      await firstValueFrom(
        this.httpService.post(sendUrl, body, {
          headers: { 'X-API-KEY': apiToken, ACCEPT: 'application/json' },
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * اطلاع به ادمین بعد از کلیک مالک روی موبایل
   * @param ownerMobile
   * @param title
   * @param guestMobile
   * @param date
   * @param duration
   * @param guestsCount
   * @returns
   */
  async sendClickGuestMobileToAdmin(
    adminMobile: string,
    propertyCode: string,
    reserveNumber: number,
  ): Promise<void> {
    if (!this.isProduction) return;

    try {
      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.sendClickGuestMobileSmsTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      const body = {
        parameters: [
          { name: 'PROPERTY_CODE', value: propertyCode },
          { name: 'RESERVE_NUMBER', value: reserveNumber },
        ],
        mobile: adminMobile,
        templateId: templateId,
      };

      console.dir(body);
      await firstValueFrom(
        this.httpService.post(sendUrl, body, {
          headers: { 'X-API-KEY': apiToken, ACCEPT: 'application/json' },
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * ارسال لینک های مشابه برای مهمان
   * @param mobile
   * @param links
   * @param propertyTitle
   * @returns
   */
  async sendRecommendationLinks(mobile: string, links: string[], propertyTitle: string): Promise<void> {
    if (!this.isProduction) return;

    try {
      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.sendRecommendedPropertyTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      if (links?.length < 1) return;
      let parameters = [];
      links.map((e, i) => {
        parameters.push({ name: `PROPERTY_CODE${i + 1}`, value: e });
      });
      parameters.push({ name: 'TITLE', value: propertyTitle.substring(0, 39) });

      const body = {
        parameters: parameters,
        mobile: mobile,
        templateId: templateId,
      };

      await firstValueFrom(
        this.httpService.post(sendUrl, body, {
          headers: { 'X-API-KEY': apiToken, ACCEPT: 'application/json' },
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * ارسال پیام به میزبان بابت پیام مهمان
   * @param mobile
   * @param propertyTitle
   * @param chatroomId
   */
  async sendChatHintToOwner(mobile: string, propertyTitle: string, chatroomId: string): Promise<void> {
    if (!this.isProduction) return;

    try {
      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.sendChatHintTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      const body = {
        parameters: [
          { name: 'TITLE', value: propertyTitle.substring(0, 39) },
          { name: 'CHAT_ID', value: chatroomId },
        ],
        mobile: mobile,
        templateId: templateId,
      };

      await firstValueFrom(
        this.httpService.post(sendUrl, body, {
          headers: { 'X-API-KEY': apiToken, ACCEPT: 'application/json' },
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * پیامک به مهمانی که رزرو کرده بعد از خرید اشتراک توسط میزبان
   * @param mobile
   * @param propertyTitle
   * @param chatroomId
   */
  async sendPropertyReserveHintToGuest(mobile: string, propertyTitle: string): Promise<void> {
    if (!this.isProduction) return;

    try {
      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.sendReserveHintToGuestTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      const body = {
        parameters: [{ name: 'TITLE', value: propertyTitle.substring(0, 39) }],
        mobile: mobile,
        templateId: templateId,
      };

      console.log({ body });

      await firstValueFrom(
        this.httpService.post(sendUrl, body, {
          headers: { 'X-API-KEY': apiToken, ACCEPT: 'application/json' },
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }
}
