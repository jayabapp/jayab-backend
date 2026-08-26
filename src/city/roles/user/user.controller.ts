import { Controller, Get, Param, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CITY_USER_ROUTE_GROUP } from 'src/city/common/route-group.constant';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllCityUserDto } from './dto/find-all.dto';
import { CitySharedService } from '../../shared.service';
import { FIVE_MINUTES_TTL } from 'src/common/utils/constants/cache-ttl.constant';

@ApiTags('Cities - USER')
@Controller(CITY_USER_ROUTE_GROUP)
export class CityUserController {
  constructor(private readonly citySharedService: CitySharedService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(FIVE_MINUTES_TTL)
  @ApiOperation({ summary: 'Find All', operationId: 'cityUserFindAll' })
  @Get()
  async findAll(@Query() dto: FindAllCityUserDto): Promise<SuccessResponseArgs> {
    const result = await this.citySharedService.findAll(dto);
    return { result };
  }

  @ApiOperation({ summary: 'Find children', operationId: 'cityUserFindChildren' })
  @Get(':parentId')
  async findChildren(@Param('parentId', ParseIntPipe) parentId: number): Promise<SuccessResponseArgs> {
    const result = await this.citySharedService.findChildren(parentId);
    return { result };
  }
}
