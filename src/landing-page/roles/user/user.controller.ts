import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FindAllLandingPageUserDto } from './dto/find-all.dto';
import { ResolveLandingLocationDto } from './dto/resolve-location.dto';
import { LandingPageUserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { THREE_MINUTES_TTL } from 'src/common/utils/constants/cache-ttl.constant';
import { USER_ROUTE_GROUP } from 'src/landing-page/common/route-group.constant';

@ApiTags('LandingPage - USER')
@Controller(USER_ROUTE_GROUP)
export class LandingPageUserController {
  constructor(private readonly landingPageUserService: LandingPageUserService) {}

  @ApiOperation({ summary: 'Find All', description: '', operationId: 'landingPageUserFindAll' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(THREE_MINUTES_TTL)
  @Get()
  async findAll(@Query() dto: FindAllLandingPageUserDto): Promise<SuccessResponseArgs> {
    const result = await this.landingPageUserService.findAll(dto);
    return { result };
  }

  @ApiOperation({
    summary: 'Resolve canonical landing for a location',
    operationId: 'landingPageResolveLocation',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(THREE_MINUTES_TTL)
  @Get('resolve/location')
  async resolveLocation(@Query() dto: ResolveLandingLocationDto): Promise<SuccessResponseArgs> {
    const result = await this.landingPageUserService.resolveLocation(dto);
    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '', operationId: 'landingPageUserFindOne' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(THREE_MINUTES_TTL)
  @Get(':landingPageUrl')
  async findOne(@Param('landingPageUrl') landingPageUrl: string): Promise<SuccessResponseArgs> {
    const result = await this.landingPageUserService.findOne(landingPageUrl);
    return { result };
  }
}
