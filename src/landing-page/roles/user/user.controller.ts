import {
  Controller,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
// import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/landing-page/common/route-group.constant';
import { LandingPageUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllLandingPageUserDto } from './dto/find-all.dto';

@ApiTags('LandingPage - USER')
// @UseGuards(UserJwtGuard)
// @ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class LandingPageUserController {
  constructor(private readonly landingPageUserService: LandingPageUserService) {}

  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllLandingPageUserDto): Promise<SuccessResponseArgs> {
    const result = await this.landingPageUserService.findAll(dto);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get(':landingPageUrl')
  async findOne(@Param('landingPageUrl') landingPageUrl: string): Promise<SuccessResponseArgs> {
    const result = await this.landingPageUserService.findOne(landingPageUrl);

    return { result };
  }
}
