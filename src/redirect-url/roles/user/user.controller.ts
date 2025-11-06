import {
  Controller,
  // Delete,
  Get,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
// import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/redirect-url/common/route-group.constant';
import { RedirectUrlUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('RedirectUrl - USER')
// @UseGuards(UserJwtGuard)
// @ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class RedirectUrlUserController {
  constructor(private readonly redirectUrlUserService: RedirectUrlUserService) {}

  @ApiOperation({ summary: 'Find one by source hash', description: 'source hash is md5' })
  @Get(':sourceHash')
  async findOne(@Param('sourceHash') sourceHash: string): Promise<SuccessResponseArgs> {
    const result = await this.redirectUrlUserService.findOne(sourceHash);

    return { result };
  }
}
