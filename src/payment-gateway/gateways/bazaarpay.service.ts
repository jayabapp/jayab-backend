import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { PaymentGatewayEnum, PaymentGatewayParams } from '../common/payment-gateway.enum';
import { PaymentGatewayUserService } from '../roles/user/user.service';

export enum BazaarPayCheckoutStatus {
  INVALID_TOKEN = 'invalid_token',
  UNPAID = 'unpaid',
  PAID_NOT_COMMITTED = 'paid_not_committed',
  PAID_NOT_COMMITTED_REFUNDED = 'paid_not_committed_refunded',
  PAID_COMMITTED = 'paid_committed',
  REFUNDED = 'refunded',
  TIMED_OUT = 'timed_out',
}

type BazaarPayConfig = {
  destination: string;
  serviceName: string;
  authorizationToken: string;
};

type BazaarPayInitResponse = {
  checkout_token: string;
  payment_url: string;
};

type BazaarPayTraceResponse = {
  status: BazaarPayCheckoutStatus;
};

@Injectable()
export class BazaarPayService {
  private readonly logger = new Logger(BazaarPayService.name);
  private readonly apiBaseUrl = 'https://api.bazaar-pay.ir/badje/v1';
  private readonly callbackBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly paymentGatewayUserService: PaymentGatewayUserService,
  ) {
    this.callbackBaseUrl = this.configService.get('payment.paymentBaseUrl');
  }

  async create(
    amount: number,
    mobileNumber?: string,
  ): Promise<{ gatewayUrl: string; gatewayAuthority: string }> {
    const config = await this.getConfig();

    try {
      const response = await firstValueFrom(
        this.httpService.post<BazaarPayInitResponse>(
          `${this.apiBaseUrl}/checkout/init/`,
          {
            amount,
            destination: config.destination,
            service_name: config.serviceName,
            // destination: 'developers',
            // service_name: 'product 1',
          },
          { headers: this.buildHeaders(config.authorizationToken) },
        ),
      );

      const checkoutToken = response.data?.checkout_token;
      const paymentUrl = response.data?.payment_url;
      if (!checkoutToken || !paymentUrl) throw new Error('BazaarPay init response is invalid');

      const gatewayUrl = new URL(paymentUrl);
      const callbackUrl = new URL(`${this.callbackBaseUrl}/payments/callback`);
      callbackUrl.searchParams.set('Authority', checkoutToken);

      if (mobileNumber) gatewayUrl.searchParams.set('phone', mobileNumber);
      gatewayUrl.searchParams.set('redirect_url', callbackUrl.toString());

      return { gatewayUrl: gatewayUrl.toString(), gatewayAuthority: checkoutToken };
    } catch (error) {
      this.handleError('init checkout', error);
    }
  }

  async trace(checkoutToken: string): Promise<BazaarPayCheckoutStatus> {
    const config = await this.getConfig();

    try {
      const response = await firstValueFrom(
        this.httpService.post<BazaarPayTraceResponse>(
          `${this.apiBaseUrl}/trace/`,
          { checkout_token: checkoutToken },
          { headers: this.buildHeaders(config.authorizationToken) },
        ),
      );

      const status = response.data?.status;
      if (!Object.values(BazaarPayCheckoutStatus).includes(status))
        throw new Error('BazaarPay trace response is invalid');

      return status;
    } catch (error) {
      this.handleError('trace checkout', error);
    }
  }

  async commit(checkoutToken: string): Promise<void> {
    const config = await this.getConfig();

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiBaseUrl}/commit/`,
          { checkout_token: checkoutToken },
          { headers: this.buildHeaders(config.authorizationToken) },
        ),
      );

      if (response.status !== 204) throw new Error(`BazaarPay commit returned status ${response.status}`);
    } catch (error) {
      this.handleError('commit checkout', error);
    }
  }

  private async getConfig(): Promise<BazaarPayConfig> {
    const gateway = await this.paymentGatewayUserService.findOneByKey(PaymentGatewayEnum.BAZAARPAY);
    const params = gateway?.params as PaymentGatewayParams[];
    const destination = params?.find((item) => item.key === 'destination')?.value;
    const serviceName = params?.find((item) => item.key === 'service_name')?.value || 'خرید اشتراک جایاب';
    const authorizationToken = params?.find((item) => item.key === 'authorization_token')?.value;

    if (!destination || !authorizationToken) {
      this.logger.error('BazaarPay destination or authorization token does not exist');
      throw new BadGatewayException('PAY1');
    }

    return { destination, serviceName, authorizationToken };
  }

  private buildHeaders(authorizationToken: string): Record<string, string> {
    return {
      Authorization: `Token ${authorizationToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Jayab-Backend',
    };
  }

  private handleError(operation: string, error: unknown): never {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const responseData = axiosError.response?.data;
    const serializedResponse =
      typeof responseData === 'string'
        ? responseData.slice(0, 2000)
        : JSON.stringify(responseData)?.slice(0, 2000);

    this.logger.error(
      `BazaarPay ${operation} failed - status: ${status || 'unknown'} - response: ${serializedResponse || 'empty'}`,
    );
    throw new BadGatewayException('PAY1');
  }
}
