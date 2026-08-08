import { validate } from 'class-validator';
import { BuySubscriptionAdvisorDto } from 'src/profile/roles/user/dto/register.dto';
import { PaySubscriptionPropertyOwnerDto } from 'src/property/roles/owner/dto/pay-subscription.dto';
import { PaymentGatewayEnum } from '../common/payment-gateway.enum';

describe('BazaarPay payment DTOs', () => {
  it.each([PaySubscriptionPropertyOwnerDto, BuySubscriptionAdvisorDto])(
    'accepts BAZAARPAY in %p',
    async (dtoClass) => {
      const dto = Object.assign(new dtoClass(), {
        redirect_url: 'https://jayab.example/result',
        gateway: PaymentGatewayEnum.BAZAARPAY,
      });

      const errors = await validate(dto);

      expect(errors.find((error) => error.property === 'gateway')).toBeUndefined();
    },
  );
});
