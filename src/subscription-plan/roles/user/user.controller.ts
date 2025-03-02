import { Controller, Get, Param, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/subscription-plan/common/route-group.constant';
import { SubscriptionPlanUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllSubscriptionPlanUserDto } from './dto/find-all.dto';
import { RequestType } from 'src/common/interfaces/user.interface';
import { FIVE_MINUTES_TTL } from 'src/common/utils/constants/cache-ttl.constant';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('SubscriptionPlan - USER')
@UseGuards(UserJwtGuard)
@ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class SubscriptionPlanUserController {
  constructor(private readonly subscriptionPlanUserService: SubscriptionPlanUserService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(FIVE_MINUTES_TTL)
  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(
    @Req() req: RequestType,
    @Query() dto: FindAllSubscriptionPlanUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;
    const result = await this.subscriptionPlanUserService.findAll(user, dto);
    return { result };
  }
}
