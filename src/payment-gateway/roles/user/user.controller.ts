import {
  Controller,
  // Delete,
  Get,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
// import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/payment-gateway/common/route-group.constant';
import { PaymentGatewayUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';

@ApiTags('PaymentGateway - USER')
// @UseGuards(UserJwtGuard)
// @ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class PaymentGatewayUserController {
  constructor(private readonly paymentGatewayUserService: PaymentGatewayUserService) {}

  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(): Promise<SuccessResponseArgs> {
    const result = await this.paymentGatewayUserService.findAll();

    return { result };
  }
}
