import {
  Body,
  Controller,
  // Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/property/common/route-group.constant';
import { PropertyUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllPropertyUserDto } from './dto/find-all.dto';

@ApiTags('Property - USER')
// @UseGuards(UserJwtGuard)
// @ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class PropertyUserController {
  constructor(private readonly propertyUserService: PropertyUserService) {}

  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPropertyUserDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyUserService.findAll(dto);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One By Slug', description: '' })
  @ApiHeader({ name: 'fingerprint', required: true })
  @Get(':propertySlug')
  async findOne(
    @Param('propertySlug') propertySlug: string,
    @Headers() headers: { fingerprint: string },
  ): Promise<SuccessResponseArgs> {
    if (!headers.fingerprint) throw new UnauthorizedException('Unauthorized');
    const result = await this.propertyUserService.findOne(propertySlug);
    await this.propertyUserService.updateViewStatistics(result.id, headers.fingerprint);
    return { result };
  }

  @ApiOperation({ operationId: 'Find Contact Info', description: '' })
  @Get(':propertySlug/contact-info')
  async findContactInfo(@Param('propertySlug') propertySlug: string): Promise<SuccessResponseArgs> {
    const result = await this.propertyUserService.findContactInfo(propertySlug);
    return { result };
  }
}
