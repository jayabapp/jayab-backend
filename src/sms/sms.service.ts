import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async sendVerificationCode(mobile: string, code: string): Promise<void> {
    try {
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
}
