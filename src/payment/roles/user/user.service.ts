import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Payment, Prisma, Property, Subscription, User } from '@prisma/client';
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
import { PropertySubscription } from 'src/property/common/types/property-subscription.type';
import { first } from 'lodash';
import { endOfDate } from 'src/common/helpers/date.helper';
import moment from 'moment-jalaali';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';

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
        gate: gateway,
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

  async subscriptionPaymentCallback(payment: Payment): Promise<Payment> {
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

    if (!isVerified) return;

    console.log({ isVerified });

    /* ----------------------------- PAYMENT PROCESS ---------------------------- */
    const updatedPayment = await this.db.$transaction(async (tx) => {
      const refId = uuidv7();

      // update payment
      const item = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatuses.APPROVED,
          ref_id: refId,
          subscriptions: {
            updateMany: { where: { payment_id: payment.id }, data: { status: PropertySubscription.SUCCESS } },
          },
        },
        include: {
          subscriptions: {
            select: {
              property: { select: { id: true, subscription_expired_at: true } },
              is_promote: true,
              duration: true,
            },
          },
        },
      });

      const property = first(item.subscriptions)?.property;

      console.log({ item, property });

      for (const e of item.subscriptions) {
        if (e?.is_promote) {
          await tx.property.update({ where: { id: property.id }, data: { sort_order: Date.now() } });
        } else {
          const lastSubExpiredAt = property?.subscription_expired_at || undefined;
          const newExpDate = endOfDate(moment(lastSubExpiredAt).add(e.duration, 'days').toDate());

          //
          await tx.property.update({
            where: { id: property.id },
            data: { subscription_expired_at: newExpDate, status: PropertyStatuses.WAITING },
          });
        }
      }

      return item;
    });

    /* -------------------------------------------------------------------------- */
    /* SEND NOTIFICATION */
    // await this.notificationSharedService.createNotification({
    //   user: { id: null, role: UserRole.ADMIN },
    //   mustSendNotif: true,
    //   notification: {
    //     title: 'سفارش جدید',
    //     body: `یک سفارش جدید ثبت شده`,
    //   },
    //   notificationType: NotificationTypes.NEW_ORDER,
    //   notificationableId: updatedPayment?.order_id?.toString(),
    // });

    return updatedPayment;
  }

  async checkAuthority(authority: string): Promise<{ payment: Payment; isValid: boolean } | undefined> {
    const payment = await this.db.payment.findFirst({
      where: { authority },
      include: { subscriptions: true, property: true },
    });

    if (payment?.status !== PaymentStatuses.INIT) {
      if (payment) await this.updatePaymentStatus(payment.id, PaymentStatuses.FAILED);
      return { payment, isValid: false };
    }
    console.log({ payment });

    return { payment, isValid: true };
  }

  async updatePaymentStatus(paymentId: number, status: PaymentStatuses): Promise<Payment> {
    return await this.db.payment.update({ where: { id: paymentId }, data: { status } });
  }
}
