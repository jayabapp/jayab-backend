import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/subscription/common/route-group.constant';
import { SubscriptionUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllSubscriptionUserDto } from './dto/find-all.dto';
import { PartialUser, RequestType } from 'src/common/interfaces/user.interface';

@ApiTags('Subscription - USER')
@UseGuards(UserJwtGuard)
@ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class SubscriptionUserController {
  constructor(private readonly subscriptionUserService: SubscriptionUserService) {}

  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(
    @Req() req: RequestType,
    @Query() dto: FindAllSubscriptionUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = req.user as PartialUser;
    const result = await this.subscriptionUserService.findAll(user, dto);

    return { result };
  }
}
