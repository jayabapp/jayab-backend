import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly httpService: HttpService, private configService: ConfigService) {}

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

  async sendOrderStatus(
    mobile: string,
    userFullName: string,
    businessName: string,
    status: string,
  ): Promise<void> {
    try {
      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.orderStatusTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      const body = {
        parameters: [
          { name: 'Name', value: userFullName },
          { name: 'BusinessName', value: businessName },
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

  async sendNewOrderToAdmin(mobile: string, orderCode: string, businessName: string): Promise<void> {
    try {
      const apiToken = this.configService.get('sms.smsApiToken');
      const templateId = this.configService.get('sms.newOrderTemplateId');
      const sendUrl = this.configService.get('sms.sendUrl');

      const body = {
        parameters: [
          { name: 'OrderCode', value: orderCode },
          { name: 'BusinessName', value: businessName },
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
