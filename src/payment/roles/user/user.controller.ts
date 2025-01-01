import { BadRequestException, Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { USER_ROUTE_GROUP } from 'src/payment/common/route-group.constant';
import { PaymentUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { SocketService } from 'src/socket/socket.service';
import { random } from 'lodash';
import { getB2cConfig } from 'src/config/b2c.config';
import { SettingAdminService } from 'src/setting/roles/admin/admin.service';
import { SettingKey } from 'src/setting/common/interfaces/settings.interface';
import { SmsService } from 'src/sms/sms.service';

@ApiTags('Payment - USER')
@Controller(USER_ROUTE_GROUP)
export class PaymentUserController {
  constructor(
    private readonly paymentUserService: PaymentUserService,
    private configService: ConfigService,
    // private readonly socketService: SocketService,
    private readonly settingAdminService: SettingAdminService,
    private readonly smsService: SmsService,
  ) {}

  // @ApiOperation({ operationId: 'Callback' })
  // @Get('callback')
  // async paymentCallback(
  //   @Res() res: Response,
  //   @Query('Authority') authority: string,
  // ): Promise<SuccessResponseArgs> {
  //   const payment = await this.paymentUserService.checkAuthority(authority);

  //   if (!payment) throw new BadRequestException('PAY4');

  //   const result = await this.paymentUserService.paymentCallback(payment);
  //   const redirect_url = payment.redirect_url;

  //   if (!result)
  //     //failed
  //     res.render('failed-payment', {
  //       pageTitle: `پرداخت ناموفق|‌ ${getB2cConfig('APP_FA_NAME')}`,
  //       status: 'پرداخت ناموفق',
  //       message: `برای بازگشت به ${getB2cConfig('APP_FA_NAME')} روی دکمه زیر کلیک کنید`,
  //       redirectButtonTitle: `بازگشت به ${getB2cConfig('APP_FA_NAME')}`,
  //       redirect_url,
  //     });
  //   else {
  //     //success
  //     res.render('success-payment', {
  //       pageTitle: `پرداخت موفق|‌ ${getB2cConfig('APP_FA_NAME')}`,
  //       status: 'پرداخت موفقیت آمیز',
  //       message: `برای بازگشت به ${getB2cConfig('APP_FA_NAME')} روی دکمه زیر کلیک کنید`,
  //       redirectButtonTitle: `بازگشت به ${getB2cConfig('APP_FA_NAME')}`,
  //       amount: result.amount,
  //       RefID: result.ref_id,
  //       redirect_url,
  //     });

  //     /**
  //      * send event to admin panel
  //      */
  //     // this.socketService.emitToAdmins({
  //     //   event: 'NewOrder',
  //     //   eventData: result.order_id,
  //     //   id: random(0, 100_000_000),
  //     //   title: 'سفارش جدید',
  //     //   body: `سفارش کاربر با شماره ${payment.order?.order_code} پرداخت شد و منتظر بررسی است`,
  //     //   type: 'info',
  //     //   route: `/orders/show/${payment.order_id}`,
  //     // });

  //     /**
  //      * send sms to admins if exist
  //      */
  //     // const adminMobile1 = await this.settingAdminService.get(SettingKey.ADMIN_SMS_MOBILE_1);
  //     // const adminMobile2 = await this.settingAdminService.get(SettingKey.ADMIN_SMS_MOBILE_2);
  //     // const adminMobile3 = await this.settingAdminService.get(SettingKey.ADMIN_SMS_MOBILE_3);
  //     // for (const mobile of [adminMobile1, adminMobile2, adminMobile3]) {
  //     //   if (!mobile) continue;
  //     //   this.smsService.sendNewOrderToAdmin(mobile, payment.order.order_code, getB2cConfig('APP_FA_NAME'));
  //     // }
  //   }

  //   return;
  // }
}
