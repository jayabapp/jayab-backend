import { PaymentGatewayEnum } from 'src/payment-gateway/common/payment-gateway.enum';
import { PaymentGatewayAdminService } from './admin.service';

describe('PaymentGatewayAdminService BazaarPay', () => {
  const bazaarPayGateway = {
    id: 1,
    key: PaymentGatewayEnum.BAZAARPAY,
    params: [
      { title: 'نام پذیرنده', key: 'destination', value: 'jayab' },
      { title: 'نام سرویس', key: 'service_name', value: 'خرید اشتراک جایاب' },
      { title: 'توکن احراز هویت', key: 'authorization_token', value: 'secret-token' },
    ],
  };
  const db = {
    paymentGateway: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
  const cacheManager = { del: jest.fn() };

  let service: PaymentGatewayAdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    db.paymentGateway.findFirst.mockResolvedValue(bazaarPayGateway);
    db.paymentGateway.update.mockResolvedValue(bazaarPayGateway);
    service = new PaymentGatewayAdminService(db as any, cacheManager as any);
  });

  it('accepts a Persian service name and a configured authorization token', async () => {
    await expect(service.update(bazaarPayGateway.id, { params: bazaarPayGateway.params })).resolves.toBe(
      bazaarPayGateway,
    );
  });

  it('allows activation when the authorization token is configured', async () => {
    await expect(service.updatePartial(bazaarPayGateway.id, { is_active: true })).resolves.toBe(
      bazaarPayGateway,
    );
  });

  it('rejects activation without an authorization token', async () => {
    db.paymentGateway.findFirst.mockResolvedValue({
      ...bazaarPayGateway,
      params: bazaarPayGateway.params.map((param) =>
        param.key === 'authorization_token' ? { ...param, value: '' } : param,
      ),
    });

    await expect(service.updatePartial(bazaarPayGateway.id, { is_active: true })).rejects.toMatchObject({
      message: 'GATEWAY4',
    });
  });
});
