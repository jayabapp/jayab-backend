import { Controller, Get, Param, ParseIntPipe, Patch, Query, UseInterceptors, Version } from '@nestjs/common';
import { FindAllBannerUserDto, FindAllBannerUserV2Dto } from './dto/find-all.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { BannerUserService } from './user.service';
import { THREE_MINUTES_TTL } from 'src/common/utils/constants/cache-ttl.constant';
import { USER_ROUTE_GROUP } from 'src/banner/common/route-group.constant';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Banner - USER')
@Controller(USER_ROUTE_GROUP)
export class BannerUserController {
  constructor(private readonly bannerUserService: BannerUserService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(THREE_MINUTES_TTL)
  @ApiOperation({ summary: 'Find All', description: '', operationId: 'bannerUserFindAll' })
  @Get()
  async findAll(@Query() dto: FindAllBannerUserDto): Promise<SuccessResponseArgs> {
    const result = await this.bannerUserService.findAll(dto);
    return { result };
  }

  @Version('2')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(THREE_MINUTES_TTL)
  @ApiOperation({
    summary: 'Find All V2',
    description: 'Array of positions',
    operationId: 'bannerUserFindAllV2',
  })
  @Get()
  async findAllV2(@Query() dto: FindAllBannerUserV2Dto): Promise<SuccessResponseArgs> {
    const result = await this.bannerUserService.findAllV2(dto);
    return { result };
  }

  @Throttle({ default: { limit: 10, ttl: 30000 } })
  @ApiOperation({ summary: 'Update view count', operationId: 'bannerUserUpdateViewCount' })
  @Patch(':bannerId')
  async updateViewCount(@Param('bannerId', ParseIntPipe) bannerId: number): Promise<SuccessResponseArgs> {
    await this.bannerUserService.updateViewCount(bannerId);
    return {};
  }
}
