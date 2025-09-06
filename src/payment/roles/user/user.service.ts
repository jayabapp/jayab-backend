import { BadGatewayException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Payment, Prisma, Subscription, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TurnoverType } from 'src/payment/common/turnover-type.enum';
import { PaymentGatewayEnum } from 'src/payment-gateway/common/payment-gateway.enum';
import { v7 as uuidv7 } from 'uuid';
import { ZarinpalService } from 'src/payment-gateway/gateways/zarinpal.service';
import { ConfigService } from '@nestjs/config';
import { MD5 } from 'crypto-js';
import { PaymentStatuses } from 'src/payment/common/payment-status.enum';
import { PartialUser } from 'src/common/interfaces/user.interface';
import { endOfDate } from 'src/common/helpers/date.helper';
import moment from 'moment-jalaali';
import { AdvisorStatus } from 'src/advisor/common/advisor-status.type';
import { SubscriptionStatus } from 'src/subscription/common/subscription-status.type';

@Injectable()
export class PaymentUserService {
  constructor(
    private readonly db: PrismaService,
    private readonly config: ConfigService,
    private readonly zarinpalService: ZarinpalService,
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
    turnoverType: TurnoverType,
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
        gate: gateway,
        authority,
        redirect_url: redirectUrl,
        status: PaymentStatuses.INIT,
        type: turnoverType,
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

  async subscriptionPaymentCallback(payment: Payment): Promise<{
    updatedPayment: Payment;
    subscription: Subscription & { property: { owner: { user: Partial<User> } } };
  }> {
    /* ----------------------------- PAYMENT PROCESS ---------------------------- */
    const { updatedPayment, subscription } = await this.db.$transaction(async (tx) => {
      const refId = uuidv7();

      /* update payment */
      const item = await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatuses.APPROVED, ref_id: refId },
      });

      /* update subscription */
      const subscription = await tx.subscription.update({
        where: { payment_id: payment.id },
        data: { status: SubscriptionStatus.SUCCESS },
        include: {
          property: {
            select: {
              id: true,
              subscription_expired_at: true,
              owner: { select: { user: { select: { mobile_number: true, full_name: true } } } },
            },
          },
        },
      });
      const property = subscription.property;

      /*  */
      const lastSubExpiredAt = property?.subscription_expired_at || undefined;
      const now = moment();
      let newExpDate = null;

      //اگر فقط نردبان باشه در زمان سیو کردن اشتراک تعداد روز رو صفر میزاریم که اینجا تاثیری نداشته باشه
      if (lastSubExpiredAt && now.isAfter(lastSubExpiredAt))
        newExpDate = now.add(subscription.duration + 1, 'days').toDate();
      else
        newExpDate = moment(lastSubExpiredAt)
          .add(subscription.duration + 1, 'days')
          .toDate();

      let propertyUpdateData: Prisma.PropertyUpdateInput = { subscription_expired_at: newExpDate };
      if (subscription.is_promote) {
        propertyUpdateData['sort_order'] = Date.now();
        propertyUpdateData['promoted_at'] = new Date();
      }

      await tx.property.update({ where: { id: property.id }, data: propertyUpdateData });

      return { updatedPayment: item, subscription };
    });

    return { updatedPayment, subscription };
  }

  async subscriptionAdvisorPaymentCallback(
    payment: Payment,
  ): Promise<{
    updatedPayment: Payment;
    subscription: Subscription & { property: { owner: { user: Partial<User> } } };
  }> {
    /* ----------------------------- PAYMENT PROCESS ---------------------------- */
    const updatedPayment = await this.db.$transaction(async (tx) => {
      const refId = uuidv7();

      /* update payment */
      const item = await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatuses.APPROVED, ref_id: refId },
      });

      /* update subscription */
      const subscription = await this.db.subscription.update({
        where: { payment_id: payment.id },
        data: { status: SubscriptionStatus.SUCCESS },
        include: {
          advisor: { select: { id: true, subscription_expired_at: true, status: true, is_special: true } },
        },
      });
      const advisor = subscription.advisor;

      /*  */
      const lastSubExpiredAt = advisor?.subscription_expired_at || undefined;
      const now = moment();
      let newExpDate = null;

      if (now.isAfter(lastSubExpiredAt) || advisor.is_special !== subscription.is_special_advisor)
        newExpDate = now.add(subscription.duration + 1, 'days').toDate();
      else
        newExpDate = moment(lastSubExpiredAt)
          .add(subscription.duration + 1, 'days')
          .toDate();

      /**
       * وضعیت کاربری که ویژه نیست و اشتراک ویژه میخرد باید به در انتظار تایید تغییر کند
       */
      let status: AdvisorStatus = advisor.status;
      if (!advisor.is_special || subscription.is_special_advisor) status = AdvisorStatus.PENDING;

      /*  */
      await tx.advisor.update({
        where: { id: advisor.id },
        data: { subscription_expired_at: newExpDate, is_special: subscription.is_special_advisor, status },
      });

      return item;
    });

    return { updatedPayment, subscription: null }; //اینجا فعلا نیازی به جزییات اشتراک نداریم
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPER                                   */
  /* -------------------------------------------------------------------------- */
  async checkAuthority(authority: string): Promise<{ payment: Payment; isAuthValid: boolean } | undefined> {
    const payment = await this.db.payment.findFirst({
      where: { authority },
      // include: { subscriptions: true, property: true },
    });

    if (payment?.status !== PaymentStatuses.INIT) {
      if (payment) await this.updatePaymentStatus(payment.id, PaymentStatuses.FAILED);
      return { payment, isAuthValid: false };
    }

    return { payment, isAuthValid: true };
  }

  async updatePaymentStatus(paymentId: number, status: PaymentStatuses): Promise<Payment> {
    return await this.db.payment.update({ where: { id: paymentId }, data: { status } });
  }

  async checkGateWay(payment: Payment): Promise<boolean> {
    const gateway = payment.gateway_key as PaymentGatewayEnum;
    let isVerified = false;

    switch (gateway) {
      case PaymentGatewayEnum.SANDBOX:
        isVerified = true;
        break;

      case PaymentGatewayEnum.ZARINPAL:
        const res = await this.zarinpalService.verify(payment);
        isVerified = res?.isValid;
        break;

      default:
        break;
    }

    if (!isVerified) await this.updatePaymentStatus(payment.id, PaymentStatuses.FAILED);

    return isVerified;
  }
}
