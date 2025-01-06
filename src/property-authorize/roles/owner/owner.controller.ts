import {
  BadRequestException,
  Body,
  Controller,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { OwnerJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OWNER_ROUTE_GROUP } from 'src/property-authorize/common/route-group.constant';
import { PropertyAuthorizeOwnerService } from './owner.service';
import { CreatePropertyAuthorizeOwnerDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdatePropertyAuthorizeOwnerDto } from './dto/update.dto';
import { FindAllPropertyAuthorizeOwnerDto } from './dto/find-all.dto';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { PartialUser, RequestType } from 'src/common/interfaces/user.interface';
import {
  OwnerUpdatePropertyInterceptor,
  PropertyInterceptorData,
} from 'src/property/common/interceptors/owner-property.interceptor';
import { PropertyAuthorizeStatuses } from 'src/property-authorize/common/property-authorize-status.type';

@ApiTags('PropertyAuthorize - OWNER')
@UseGuards(UserJwtGuard, OwnerGuard)
@ApiBearerAuth('user-jwt')
@Controller(OWNER_ROUTE_GROUP)
export class PropertyAuthorizeOwnerController {
  constructor(private readonly propertyAuthorizeOwnerService: PropertyAuthorizeOwnerService) {}

  @ApiOperation({ operationId: 'Create', description: '' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Post()
  async create(
    @Req() req: RequestType,
    @Body() dto: CreatePropertyAuthorizeOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyAuthorizeOwnerService.create(dto);

    return { result, messageCode: 'CREATE' };
  }

  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPropertyAuthorizeOwnerDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyAuthorizeOwnerService.findAll(dto);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get(':propertyAuthorizeId')
  async findOne(
    @Req() req: RequestType,
    @Param('propertyAuthorizeId', ParseIntPipe) propertyAuthorizeId: number,
  ): Promise<SuccessResponseArgs> {
    const user = req.user as PartialUser;
    const result = await this.propertyAuthorizeOwnerService.findOne(propertyAuthorizeId, user.owner_id);

    return { result };
  }

  @ApiOperation({ operationId: 'Update', description: '' })
  @Put(':propertyAuthorizeId')
  async update(
    @Req() req: RequestType,
    @Param('propertyAuthorizeId', ParseIntPipe) propertyAuthorizeId: number,
    @Body() dto: UpdatePropertyAuthorizeOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const user = req.user as PartialUser;

    const authoriezed = await this.propertyAuthorizeOwnerService.findOne(propertyAuthorizeId, user.owner_id);
    if (authoriezed.status === PropertyAuthorizeStatuses.APPROVED)
      throw new BadRequestException('PROPERTY_AUTH1');

    const result = await this.propertyAuthorizeOwnerService.update(propertyAuthorizeId, dto);

    return { result, messageCode: 'UPDATE' };
  }

  // @ApiOperation({ operationId: 'Remove', description: '' })
  // @Delete(':propertyAuthorizeId')
  // async remove(@Param('propertyAuthorizeId', ParseIntPipe) propertyAuthorizeId: number): Promise<SuccessResponseArgs> {
  //   await this.propertyAuthorizeOwnerService.findOne(propertyAuthorizeId);
  //   await this.propertyAuthorizeOwnerService.remove(propertyAuthorizeId);

  //   return { messageCode: 'DELETE' };
  // }
}
