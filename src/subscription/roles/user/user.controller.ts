import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { RequestType } from 'src/common/interfaces/user.interface';
import { USER_ROUTE_GROUP } from 'src/subscription/common/route-group.constant';
import { FindAllSubscriptionUserDto } from './dto/find-all.dto';
import { SubscriptionUserService } from './user.service';

@ApiTags('Subscription - USER')
@UseGuards(UserJwtGuard)
@ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class SubscriptionUserController {
  constructor(private readonly subscriptionUserService: SubscriptionUserService) {}

  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(
    @Req() req: RequestType,
    @Query() dto: FindAllSubscriptionUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;
    const result = await this.subscriptionUserService.findAll(user, dto);

    return { result };
  }
}
