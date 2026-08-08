import { PaymentGatewayEnum } from '../common/payment-gateway.enum';
import { gateways } from '../../../prisma/seed/payment-gateway.seeder';

describe('paymentGatewaySeeder BazaarPay', () => {
  it('defines an inactive BazaarPay gateway with the required parameters', () => {
    const bazaarPayGateway = gateways().find((gateway) => gateway.key === PaymentGatewayEnum.BAZAARPAY);

    expect(bazaarPayGateway).toMatchObject({
      title: 'بازارپی',
      key: PaymentGatewayEnum.BAZAARPAY,
      logo: '',
      is_active: false,
    });
    expect(bazaarPayGateway.params).toEqual([
      { title: 'نام پذیرنده', key: 'destination', value: '' },
      { title: 'نام سرویس', key: 'service_name', value: 'خرید اشتراک جایاب' },
      { title: 'توکن احراز هویت', key: 'authorization_token', value: '' },
    ]);
  });
});
