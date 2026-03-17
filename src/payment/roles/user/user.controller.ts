import { BadRequestException, Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { USER_ROUTE_GROUP } from 'src/payment/common/route-group.constant';
import { PaymentUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { getB2cConfig } from 'src/config/b2c.config';
import { SettingAdminService } from 'src/setting/roles/admin/admin.service';
import { SmsService } from 'src/sms/sms.service';
import { TurnoverType } from 'src/payment/common/turnover-type.enum';
import { Payment, Subscription, User } from '@prisma/client';
import { InjectQueue } from '@nestjs/bull';
import { PAYMENT_SMS_JOB, PAYMENT_SMS_QUEUE } from 'src/payment/processors/queue-name.constants';
import { Queue } from 'bull';

@ApiTags('Payment - USER')
@Controller(USER_ROUTE_GROUP)
export class PaymentUserController {
  constructor(
    @InjectQueue(PAYMENT_SMS_QUEUE) private readonly paymentSmsQueue: Queue,
    private readonly paymentUserService: PaymentUserService,
    private configService: ConfigService,
    // private readonly socketService: SocketService,
    private readonly settingAdminService: SettingAdminService,
    private readonly smsService: SmsService,
  ) {}

  @ApiOperation({ summary: 'Callback' })
  @Get('callback')
  async paymentCallback(
    @Res() res: Response,
    @Query('Authority') authority: string,
  ): Promise<SuccessResponseArgs> {
    /*  */
    const { payment, isAuthValid } = await this.paymentUserService.checkAuthority(authority);
    const isGatewayValid = await this.paymentUserService.checkGateWay(payment);

    /*  */
    const redirectUrl = payment ? payment.redirect_url : '';
    let result: {
      updatedPayment: Payment;
      subscription: Subscription & { property: { owner: { user: Partial<User> } } };
    };

    /** FAILED PAYMENT */
    if (!isAuthValid || !isGatewayValid) {
      res.render('failed-payment', {
        pageTitle: `پرداخت ناموفق|‌ ${getB2cConfig('APP_FA_NAME')}`,
        status: 'پرداخت ناموفق',
        message: `برای بازگشت به ${getB2cConfig('APP_FA_NAME')} روی دکمه زیر کلیک کنید`,
        redirectButtonTitle: `بازگشت به ${getB2cConfig('APP_FA_NAME')}`,
        redirect_url: redirectUrl,
      });
      return;
    }

    /* -------------------------------------------------------------------------- */
    switch (payment.type) {
      case TurnoverType.PAY_SUBSCRIPTION:
        result = await this.paymentUserService.subscriptionPaymentCallback(payment);
        if (result.subscription.is_promote) {
          const user = result.subscription.property.owner.user;
          await this.smsService.sendPromoteSmsToOwner(user.mobile_number, user.full_name);
        }
        if (result.subscription.extends_expire)
          this.paymentSmsQueue.add(PAYMENT_SMS_JOB, { propertyId: result.subscription.property_id });
        break;

      case TurnoverType.PAY_ADVISOR_SUBSCRIPTION:
        result = await this.paymentUserService.subscriptionAdvisorPaymentCallback(payment);
        break;

      default:
        throw new BadRequestException('COMMON4');
    }

    //success
    res.render('success-payment', {
      pageTitle: `پرداخت موفق|‌ ${getB2cConfig('APP_FA_NAME')}`,
      status: 'پرداخت موفقیت آمیز',
      message: `برای بازگشت به ${getB2cConfig('APP_FA_NAME')} روی دکمه زیر کلیک کنید`,
      redirectButtonTitle: `بازگشت به ${getB2cConfig('APP_FA_NAME')}`,
      amount: result.updatedPayment.amount,
      RefID: result.updatedPayment.ref_id,
      redirect_url: redirectUrl,
    });

    return;
  }
}
