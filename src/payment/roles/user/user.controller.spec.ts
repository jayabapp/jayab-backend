import { PaymentStatuses } from 'src/payment/common/payment-status.enum';
import { TurnoverType } from 'src/payment/common/turnover-type.enum';
import { PaymentGatewayEnum } from 'src/payment-gateway/common/payment-gateway.enum';
import { PaymentUserController } from './user.controller';

describe('PaymentUserController BazaarPay', () => {
  it('does not render success when commit fails', async () => {
    const payment = {
      id: 1,
      amount: 50_000,
      authority: 'checkout-token',
      gateway_key: PaymentGatewayEnum.BAZAARPAY,
      redirect_url: 'https://jayab.example/result',
      status: PaymentStatuses.INIT,
      type: TurnoverType.PAY_ADVISOR_SUBSCRIPTION,
    };
    const paymentUserService = {
      checkAuthority: jest.fn().mockResolvedValue({ payment, isAuthValid: true }),
      checkGateWay: jest.fn().mockResolvedValue({ isValid: true, shouldCommit: true }),
      subscriptionAdvisorPaymentCallback: jest.fn().mockResolvedValue({
        updatedPayment: { ...payment, status: PaymentStatuses.APPROVED, ref_id: 'ref-id' },
        subscription: null,
      }),
      commitGatewayPayment: jest.fn().mockRejectedValue(new Error('commit failed')),
    };
    const response = { render: jest.fn() };
    const controller = new PaymentUserController(
      { add: jest.fn() } as any,
      paymentUserService as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await expect(controller.paymentCallback(response as any, payment.authority)).rejects.toThrow(
      'commit failed',
    );
    expect(response.render).not.toHaveBeenCalledWith('success-payment', expect.any(Object));
  });
});
