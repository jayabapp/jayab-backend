import { Payment } from '@prisma/client';
import { PaymentStatuses } from 'src/payment/common/payment-status.enum';
import { TurnoverType } from 'src/payment/common/turnover-type.enum';
import { PaymentGatewayEnum } from 'src/payment-gateway/common/payment-gateway.enum';
import { BazaarPayCheckoutStatus } from 'src/payment-gateway/gateways/bazaarpay.service';
import { PaymentUserService } from './user.service';

describe('PaymentUserService BazaarPay', () => {
  const payment = {
    id: 1,
    user_id: 2,
    amount: 50_000,
    gate: PaymentGatewayEnum.BAZAARPAY,
    gateway_key: PaymentGatewayEnum.BAZAARPAY,
    authority: 'checkout-token',
    status: PaymentStatuses.INIT,
    type: TurnoverType.PAY_SUBSCRIPTION,
  } as Payment;

  const db = {
    payment: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
  const config = { get: jest.fn() };
  const zarinpalService = { create: jest.fn(), verify: jest.fn() };
  const bazaarPayService = { create: jest.fn(), trace: jest.fn(), commit: jest.fn() };

  let service: PaymentUserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentUserService(
      db as any,
      config as any,
      zarinpalService as any,
      bazaarPayService as any,
    );
  });

  it('converts the amount to IRR and stores the checkout token', async () => {
    bazaarPayService.create.mockResolvedValue({
      gatewayUrl: 'https://app.bazaar-pay.ir/payment?token=checkout-token',
      gatewayAuthority: 'checkout-token',
    });
    db.payment.create.mockImplementation(({ data }) => Promise.resolve({ id: 1, ...data }));

    const result = await service.create(
      { id: 2, mobile_number: '09123456789' } as any,
      50_000,
      'https://jayab.example/result',
      PaymentGatewayEnum.BAZAARPAY,
      TurnoverType.PAY_SUBSCRIPTION,
    );

    expect(bazaarPayService.create).toHaveBeenCalledWith(500_000, '09123456789');
    expect(db.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        authority: 'checkout-token',
        gateway_key: PaymentGatewayEnum.BAZAARPAY,
      }),
    });
    expect(result.paymentUrl).toContain('checkout-token');
  });

  it('accepts paid_not_committed and requests commit', async () => {
    bazaarPayService.trace.mockResolvedValue(BazaarPayCheckoutStatus.PAID_NOT_COMMITTED);

    await expect(service.checkGateWay(payment)).resolves.toEqual({ isValid: true, shouldCommit: true });
    expect(db.payment.update).not.toHaveBeenCalled();
  });

  it('keeps an unpaid checkout in INIT status', async () => {
    bazaarPayService.trace.mockResolvedValue(BazaarPayCheckoutStatus.UNPAID);

    await expect(service.checkGateWay(payment)).resolves.toEqual({ isValid: false, shouldCommit: false });
    expect(db.payment.update).not.toHaveBeenCalled();
  });

  it('marks a terminal invalid checkout as failed', async () => {
    bazaarPayService.trace.mockResolvedValue(BazaarPayCheckoutStatus.TIMED_OUT);
    db.payment.update.mockResolvedValue({ ...payment, status: PaymentStatuses.FAILED });

    await expect(service.checkGateWay(payment)).resolves.toEqual({ isValid: false, shouldCommit: false });
    expect(db.payment.update).toHaveBeenCalledWith({
      where: { id: payment.id },
      data: { status: PaymentStatuses.FAILED },
    });
  });

  it('does not turn a finalized payment into failed on a repeated callback', async () => {
    db.payment.findFirst.mockResolvedValue({ ...payment, status: PaymentStatuses.APPROVED });

    await expect(service.checkAuthority(payment.authority)).resolves.toEqual({
      payment: { ...payment, status: PaymentStatuses.APPROVED },
      isAuthValid: false,
    });
    expect(db.payment.update).not.toHaveBeenCalled();
  });
});
