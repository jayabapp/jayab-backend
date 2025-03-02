import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { USER_ROUTE_GROUP } from 'src/property-option/common/route-group.constant';
import { PropertyOptionUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllPropertyOptionUserDto } from './dto/find-all.dto';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FIVE_MINUTES_TTL, ONE_HOUR_TTL } from 'src/common/utils/constants/cache-ttl.constant';

@ApiTags('PropertyOption - USER')
@Controller(USER_ROUTE_GROUP)
export class PropertyOptionUserController {
  constructor(private readonly propertyOptionUserService: PropertyOptionUserService) {}

  @ApiOperation({ operationId: 'Find All By Group', description: '' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(FIVE_MINUTES_TTL)
  @Get()
  async findAllByGroup(@Query() dto: FindAllPropertyOptionUserDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyOptionUserService.findAllByGroup(dto);

    return { result };
  }
}
