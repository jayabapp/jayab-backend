import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment } from '@prisma/client';
import { HttpExceptionFilter } from 'src/common/filter/http-exception.filter';
import { PrismaService } from 'src/prisma/prisma.service';
import ZarinpalCheckout from 'zarinpal-checkout';
import { PaymentGatewayUserService } from '../roles/user/user.service';
import { PaymentGatewayEnum, PaymentGatewayParams } from '../common/payment-gateway.enum';

@Injectable()
export class ZarinpalService {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  private readonly callbackUrl: string;

  constructor(
    private readonly db: PrismaService,
    private readonly config: ConfigService,
    private readonly paymentGatewayUserService: PaymentGatewayUserService,
  ) {
    this.callbackUrl = this.config.get('payment.paymentBaseUrl');
  }

  /**
   * initialize zarinpal
   * @returns
   */
  private async _init() {
    const gate = await this.paymentGatewayUserService.findOneByKey(PaymentGatewayEnum.ZARINPAL);

    const merchant = (gate?.params as PaymentGatewayParams[])?.find((e: any) => e.key === 'merchant')?.value;
    if (!merchant) return this.logger.warn('Zarinpal merchant does not exist');

    return ZarinpalCheckout.create(merchant || '', false, 'IRR');
  }

  async create(
    amount: number,
    mobileNumber: string,
  ): Promise<{ gatewayUrl: string; gatewayAuthority: string }> {
    try {
      const zarinpal = await this._init();
      const response = await zarinpal.PaymentRequest({
        Amount: amount, // IRR
        CallbackURL: `${this.callbackUrl}/payments/callback`,
        Description: 'پرداخت از درگاه',
        Email: '',
        Mobile: mobileNumber || '',
      });

      if (response.status !== 100) throw new BadGatewayException('PAY1');

      return { gatewayUrl: response.url, gatewayAuthority: response?.authority };
    } catch (error) {
      console.log('error', error);
      throw new BadGatewayException('PAY1');
    }
  }

  async verify(payment: Payment): Promise<{ isValid: boolean; status: string }> {
    try {
      const zarinpal = await this._init();

      const verifyResponse: ZarinpalCheckout.PaymentVerificationOutput = await zarinpal.PaymentVerification({
        Amount: payment?.amount,
        Authority: payment?.authority,
      });

      if (verifyResponse.status !== 100) {
        return { isValid: false, status: verifyResponse.status };
      } else return { isValid: true, status: verifyResponse.status };
    } catch (error) {
      this.logger.error(error);
    }
  }
}
