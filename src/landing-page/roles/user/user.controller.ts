import {
  Controller,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
// import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/landing-page/common/route-group.constant';
import { LandingPageUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllLandingPageUserDto } from './dto/find-all.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FIVE_MINUTES_TTL } from 'src/common/utils/constants/cache-ttl.constant';

@ApiTags('LandingPage - USER')
// @UseGuards(UserJwtGuard)
// @ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class LandingPageUserController {
  constructor(private readonly landingPageUserService: LandingPageUserService) {}

  @ApiOperation({ summary: 'Find All', description: '' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(FIVE_MINUTES_TTL)
  @Get()
  async findAll(@Query() dto: FindAllLandingPageUserDto): Promise<SuccessResponseArgs> {
    const result = await this.landingPageUserService.findAll(dto);

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(FIVE_MINUTES_TTL)
  @Get(':landingPageUrl')
  async findOne(@Param('landingPageUrl') landingPageUrl: string): Promise<SuccessResponseArgs> {
    const result = await this.landingPageUserService.findOne(landingPageUrl);

    return { result };
  }
}
