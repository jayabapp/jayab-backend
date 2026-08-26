import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { FindAllPropertyOptionUserDto } from './dto/find-all.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { PropertyOptionUserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { USER_ROUTE_GROUP } from 'src/property-option/common/route-group.constant';
import { FIVE_MINUTES_TTL } from 'src/common/utils/constants/cache-ttl.constant';

@ApiTags('PropertyOption - USER')
@Controller(USER_ROUTE_GROUP)
export class PropertyOptionUserController {
  constructor(private readonly propertyOptionUserService: PropertyOptionUserService) {}

  @ApiOperation({
    summary: 'Find All By Group',
    description: '',
    operationId: 'propertyOptionUserFindAllByGroup',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(FIVE_MINUTES_TTL)
  @Get()
  async findAllByGroup(@Query() dto: FindAllPropertyOptionUserDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyOptionUserService.findAllByGroup(dto);
    return { result };
  }
}
