import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Payment, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommonStatuses } from 'src/common/interfaces/common-status.interface';
import { TurnoverType } from 'src/payment/common/turnover-type.enum';
import { PaymentGatewayEnum } from 'src/payment-gateway/common/payment-gateway.enum';
import { v7 as uuidv7 } from 'uuid';
import { ZarinpalService } from 'src/payment-gateway/gateways/zarinpal.service';
import { NotificationSharedService } from 'src/notification/roles/shared/shared.service';
import { NotificationTypes } from 'src/firebase/constants/notif-types';
import { UserRole } from 'src/common/interfaces/role.enum';
import { ConfigService } from '@nestjs/config';
import { MD5 } from 'crypto-js';
import { PaymentStatuses } from 'src/payment/common/payment-status.enum';
import { PartialUser } from 'src/common/interfaces/user.interface';

@Injectable()
export class PaymentUserService {
  constructor(
    private readonly db: PrismaService,
    private readonly config: ConfigService,
    private readonly zarinpalService: ZarinpalService,
    // private readonly notificationSharedService: NotificationSharedService,
  ) {}

  /**
   * Create payment request
   * @param user
   * @param amount
   * @param redirectUrl
   * @param gateway
   * @returns
   */
  async create(
    user: PartialUser,
    amount: number,
    redirectUrl: string,
    gateway: PaymentGatewayEnum,
    tx?: Prisma.TransactionClient,
  ): Promise<{ paymentUrl: string; payment?: Payment }> {
    const minAmount = 1000;
    if (amount < minAmount) throw new UnprocessableEntityException('PAY2');

    try {
      let payByGateway = amount;

      /* ------------------------------- PAYMENT URL ------------------------------ */
      let paymentUrl = '';
      let authority = '';
      const amountIRR = payByGateway * 10;

      switch (gateway) {
        case PaymentGatewayEnum.SANDBOX:
          // random string
          authority = MD5((Math.random() * 1000000 + new Date().getTime()).toString())
            .toString()
            .substring(0, 12);

          paymentUrl = `${this.config.get('payment.paymentBaseUrl')}/payments/callback/?Authority=${authority}`;
          break;

        case PaymentGatewayEnum.ZARINPAL:
          const res = await this.zarinpalService.create(amountIRR, user.mobile_number);

          paymentUrl = res?.gatewayUrl;
          authority = res?.gatewayAuthority;
          break;

        default:
          break;
      }

      /* ----------------------------- CREATE PAYMENT ----------------------------- */
      let doc: Prisma.PaymentUncheckedCreateInput = {
        user_id: user.id,
        amount,
        debt: 0,
        pay_by_gateway: payByGateway,
        pay_by_wallet: 0,
        description: 'پرداخت هزینه',
        gate: PaymentGatewayEnum.ZARINPAL,
        authority,
        redirect_url: redirectUrl,
        status: PaymentStatuses.INIT,
        type: TurnoverType.PAY_SUBSCRIPTION,
        gateway_key: gateway,
      };

      const payment = tx
        ? await tx.payment.create({ data: { ...doc, redirect_url: redirectUrl } })
        : await this.db.payment.create({ data: { ...doc, redirect_url: redirectUrl } });

      return { paymentUrl, payment };
    } catch (error) {
      console.log('error', error);
      throw new BadGatewayException('PAY1');
    }
  }

  // async paymentCallback(payment: Payment & { order: Order & { offer_code: OfferCode } }): Promise<Payment> {
  //   const gateway = payment.gateway_key as PaymentGatewayEnum;
  //   let isVerified = false;
  //   console.log({ gateway, payment });

  //   if (payment.pay_from_wallet > 0) isVerified = true;
  //   else
  //     switch (gateway) {
  //       case PaymentGatewayEnum.SANDBOX:
  //         isVerified = true;
  //         break;

  //       case PaymentGatewayEnum.ZARINPAL:
  //         const res = await this.zarinpalService.verify(payment);
  //         isVerified = res?.isValid;
  //         break;

  //       default:
  //         break;
  //     }

  //   if (!isVerified) return;

  //   /* ----------------------------- PAYMENT PROCESS ---------------------------- */
  //   // پس از آپدیت وضعیت پرداخت اگر در پرداخت هزینه از کیف پول کاربر استفاده شده بود مقدار آن از کیف پول کاربر کم میشود و سفارش به حالت در حال پردازش قرار میگیرد
  //   const updatedPayment = await this.db.$transaction(async (tx) => {
  //     const refId = uuidv7();
  //     const turnoverableType = 'order';
  //     const descriptionType = 'سفارش';
  //     const turnoverableId = payment.order_id;
  //     const paymentAmount = Number(payment.amount) / 10; //convert IRR to IRT

  //     // update payment
  //     const item = await tx.payment.update({
  //       where: { id: payment.id },
  //       include: { order: true },
  //       data: { status: CommonStatuses.APPROVED, ref_id: refId },
  //     });

  //     // کد تخفیف فقط در سفارش قابل استفاده است
  //     let orderOfferCode: OfferCode | null = null;
  //     if (payment?.order?.offer_code) orderOfferCode = payment.order.offer_code;

  //     /* -------------------------------------------------------------------------- */
  //     /*                             UPDATE USER WALLET                             */
  //     /* -------------------------------------------------------------------------- */
  //     // اگر مقدار پرداخت از کیف پول بزرگتر از صفر باشد یعنی مبلغ از کیف پول پرداخت شده است
  //     if (item.pay_from_wallet && item.pay_from_wallet > 0) {
  //       // ایجاد تراکنش برای پرداخت از کیف پول
  //       await this.db.client.turnover.createWithBalanceUpdate({
  //         user_id: item.user_id,
  //         amount: -item.pay_from_wallet,
  //         title: '',
  //         description: `کسر از کیف پول برای ${descriptionType} شماره ${turnoverableId}`,
  //         type:
  //           turnoverableType === 'order'
  //             ? TurnoverType.PAY_ORDER_BY_WALLET
  //             : TurnoverType.PAY_RESERVE_BY_WALLET,
  //         turnoverable_id: turnoverableId,
  //         turnoverable_type: turnoverableType,
  //       });
  //     }

  //     /* -------------------------------------------------------------------------- */
  //     /*                                UPDATE ORDER                                */
  //     /* -------------------------------------------------------------------------- */
  //     const updatedOrder = await tx.order.update({
  //       where: { id: item.order_id },
  //       data: { status: OrderStatuses.IN_PROCESS, payment_id: item.id },
  //       include: { items: { select: { business_product_price_id: true, quantity: true } } },
  //     });

  //     /**
  //      * decrement product stock
  //      */
  //     for (const e of updatedOrder.items) {
  //       await tx.businessProductPrice.update({
  //         where: { id: e.business_product_price_id },
  //         data: { stock: { decrement: e.quantity } },
  //       });
  //     }
  //     /* -------------------------------------------------------------------------- */
  //     /*                                  TURNOVER                                  */
  //     /* -------------------------------------------------------------------------- */
  //     if (item.amount > 0 && !item.pay_from_wallet) {
  //       // ایجاد تراکنش برای پرداخت از طریق درگاه
  //       await this.db.client.turnover.createWithBalanceUpdate({
  //         user_id: item.user_id,
  //         amount: paymentAmount,
  //         title: '',
  //         description: `افزایش موجودی برای ${descriptionType} شماره ${turnoverableId}`,
  //         type: TurnoverType.GATEWAY_PAYMENT,
  //         turnoverable_id: turnoverableId,
  //         turnoverable_type: turnoverableType,
  //       });

  //       // ایجاد تراکنش برای پرداخت هزینه سفارش یا رزرو
  //       await this.db.client.turnover.createWithBalanceUpdate({
  //         user_id: item.user_id,
  //         amount: -paymentAmount,
  //         title: '',
  //         description: `پرداخت مبلغ برای ${descriptionType} شماره ${turnoverableId}`,
  //         type: turnoverableType === 'order' ? TurnoverType.PAY_ORDER : TurnoverType.PAY_RESERVE,
  //         turnoverable_id: turnoverableId,
  //         turnoverable_type: turnoverableType,
  //       });
  //     }

  //     // بررسی کد تخفیف
  //     // اگر کد تخفیف به صورت عمومی باشد جدید برای کاربر استفاده میکنیم
  //     // اگر اختصاصی باشد فقط آپدیت میکنیم
  //     // بررسی های لازم برای کد تخفیف در مرحله قبل از پرداخت انجام میشود
  //     if (orderOfferCode) {
  //       // اگر کد عمومی باشد یک رکورد جدید ایجاد میکنیم
  //       if (orderOfferCode.is_public) {
  //         await tx.customerOfferCode.create({
  //           data: { customer_id: payment.user_id, offer_code_id: orderOfferCode.id, used_at: new Date() },
  //         });
  //       } else {
  //         // اگر اختصاصی باشد رکورد مورد نظر را آپدیت میکنیم
  //         await tx.customerOfferCode.update({
  //           where: {
  //             offer_code_id_customer_id: {
  //               offer_code_id: orderOfferCode.id,
  //               customer_id: payment.user_id,
  //             },
  //           },
  //           data: { used_at: new Date() },
  //         });
  //       }
  //     }

  //     return item;
  //   });

  //   /* -------------------------------------------------------------------------- */
  //   /* SEND NOTIFICATION */
  //   await this.notificationSharedService.createNotification({
  //     user: { id: null, role: UserRole.ADMIN },
  //     mustSendNotif: true,
  //     notification: {
  //       title: 'سفارش جدید',
  //       body: `یک سفارش جدید ثبت شده`,
  //     },
  //     notificationType: NotificationTypes.NEW_ORDER,
  //     notificationableId: updatedPayment?.order_id?.toString(),
  //   });

  //   return updatedPayment;
  // }

  // async checkAuthority(
  //   authority: string,
  // ): Promise<(Payment & { order: Order & { offer_code: OfferCode } }) | undefined> {
  //   const payment = await this.db.payment.findFirst({
  //     where: { authority },
  //     include: { order: { include: { offer_code: true } } },
  //   });

  //   if (!payment || payment.status !== CommonStatuses.INIT) return;

  //   /* ------------------------------ CHECK PAYMENT ----------------------------- */
  //   // سفارش یا رزرو فقط در حالت اولیه قابل تسویه است
  //   if (payment.order_id) {
  //     const order = await this.db.order.findUnique({ where: { id: payment.order_id } });
  //     if (order.status !== OrderStatuses.INIT || order.payment_id) return;
  //   }

  //   return payment;
  // }
}
