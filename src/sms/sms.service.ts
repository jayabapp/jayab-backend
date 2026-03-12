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
  async sendCallLogToOwner(
    mobile: string,
    targetUserMobile: string,
    propertyId: number,
    isPropertyExpired: boolean,
  ): Promise<void> {
    if (!this.isProduction) return;

    try {
      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.callLogTemplateId');
      const templateIdExpired = this.configService.get('sms.callLogExpiredTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      let body = {};
      if (!isPropertyExpired)
        body = {
          parameters: [{ name: 'MOBILE', value: targetUserMobile }],
          mobile: mobile,
          templateId: templateId,
        };
      else {
        const link = `profile/owner/properties`;
        body = {
          parameters: [{ name: 'LINK', value: link }],
          mobile: mobile,
          templateId: templateIdExpired,
        };
      }

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
}
