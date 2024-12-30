import {
  Body,
  Controller,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/property/common/route-group.constant';
import { PropertyUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllPropertyUserDto } from './dto/find-all.dto';

@ApiTags('Property - USER')
@UseGuards(UserJwtGuard)
@ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class PropertyUserController {
  constructor(private readonly propertyUserService: PropertyUserService) {}

  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPropertyUserDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyUserService.findAll(dto);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get(':propertyId')
  async findOne(@Param('propertyId', ParseIntPipe) propertyId: number): Promise<SuccessResponseArgs> {
    const result = await this.propertyUserService.findOne(propertyId);

    return { result };
  }
}
