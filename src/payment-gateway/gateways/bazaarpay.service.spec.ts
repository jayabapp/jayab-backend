import { BadGatewayException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { BazaarPayCheckoutStatus, BazaarPayService } from './bazaarpay.service';

describe('BazaarPayService', () => {
  const httpService = { post: jest.fn() };
  const configService = {
    get: jest.fn().mockReturnValue('https://api.jayab.example'),
  };
  const paymentGatewayUserService = {
    findOneByKey: jest.fn().mockResolvedValue({
      params: [
        { key: 'destination', value: 'jayab' },
        { key: 'service_name', value: 'خرید اشتراک جایاب' },
        { key: 'authorization_token', value: 'secret-token' },
      ],
    }),
  };

  let service: BazaarPayService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BazaarPayService(
      httpService as any,
      configService as any,
      paymentGatewayUserService as any,
    );
  });

  it('initializes checkout and builds the web payment URL', async () => {
    httpService.post.mockReturnValue(
      of({
        status: 200,
        data: {
          checkout_token: 'checkout-token',
          payment_url: 'https://app.bazaar-pay.ir/payment?token=checkout-token',
        },
      }),
    );

    const result = await service.create(500_000, '09123456789');

    expect(httpService.post).toHaveBeenCalledWith(
      'https://api.bazaar-pay.ir/badje/v1/checkout/init/',
      {
        amount: 500_000,
        destination: 'jayab',
        service_name: 'خرید اشتراک جایاب',
      },
      {
        headers: {
          Authorization: 'Token secret-token',
          'Content-Type': 'application/json',
          'User-Agent': 'Jayab-Backend',
        },
      },
    );
    expect(result.gatewayAuthority).toBe('checkout-token');

    const gatewayUrl = new URL(result.gatewayUrl);
    expect(gatewayUrl.searchParams.get('phone')).toBe('09123456789');
    expect(gatewayUrl.searchParams.get('redirect_url')).toBe(
      'https://api.jayab.example/payments/callback?Authority=checkout-token',
    );
  });

  it('does not initialize checkout without ApiKeyAuth', async () => {
    paymentGatewayUserService.findOneByKey.mockResolvedValueOnce({
      params: [
        { key: 'destination', value: 'jayab' },
        { key: 'service_name', value: 'خرید اشتراک جایاب' },
        { key: 'authorization_token', value: '' },
      ],
    });

    await expect(service.create(500_000, '09123456789')).rejects.toEqual(new BadGatewayException('PAY1'));
    expect(httpService.post).not.toHaveBeenCalled();
  });

  it.each(Object.values(BazaarPayCheckoutStatus))('returns the trace status %s', async (status) => {
    httpService.post.mockReturnValue(of({ status: 200, data: { status } }));

    await expect(service.trace('checkout-token')).resolves.toBe(status);
  });

  it('commits a checkout token', async () => {
    httpService.post.mockReturnValue(of({ status: 204, data: undefined }));

    await expect(service.commit('checkout-token')).resolves.toBeUndefined();
    expect(httpService.post).toHaveBeenCalledWith(
      'https://api.bazaar-pay.ir/badje/v1/commit/',
      { checkout_token: 'checkout-token' },
      expect.any(Object),
    );
  });

  it.each([
    [400, { detail: 'Invalid request' }],
    [401, { detail: 'Authentication credentials were not provided.' }],
    [403, { detail: 'Permission denied' }],
    [500, { detail: 'Internal server error' }],
    [503, '<html>Service Temporarily Unavailable</html>'],
  ])('converts a provider %s response to PAY1', async (status, data) => {
    httpService.post.mockReturnValue(throwError(() => ({ response: { status, data } })));

    await expect(service.trace('checkout-token')).rejects.toEqual(new BadGatewayException('PAY1'));
  });
});
