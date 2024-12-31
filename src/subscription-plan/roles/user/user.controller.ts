import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/subscription-plan/common/route-group.constant';
import { SubscriptionPlanUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllSubscriptionPlanUserDto } from './dto/find-all.dto';

@ApiTags('SubscriptionPlan - USER')
@UseGuards(UserJwtGuard)
@ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class SubscriptionPlanUserController {
  constructor(private readonly subscriptionPlanUserService: SubscriptionPlanUserService) {}

  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllSubscriptionPlanUserDto): Promise<SuccessResponseArgs> {
    const result = await this.subscriptionPlanUserService.findAll(dto);
    return { result };
  }
}
