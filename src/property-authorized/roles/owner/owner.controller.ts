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
import { OWNER_ROUTE_GROUP, USER_ROUTE_GROUP } from 'src/property-authorized/common/route-group.constant';
import { PropertyAuthorizedOwnerService } from './owner.service';
import { CreatePropertyAuthorizedOwnerDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdatePropertyAuthorizedOwnerDto } from './dto/update.dto';
import { FindAllPropertyAuthorizedOwnerDto } from './dto/find-all.dto';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { PartialUser, RequestType } from 'src/common/interfaces/user.interface';
import {
  OwnerUpdatePropertyInterceptor,
  PropertyInterceptorData,
} from 'src/property/common/interceptors/owner-property.interceptor';
import { PropertyAuthorizeStatuses } from 'src/property-authorized/common/property-authorize-status.type';

@ApiTags('PropertyAuthorized - OWNER')
@UseGuards(UserJwtGuard, OwnerGuard)
@ApiBearerAuth('user-jwt')
@Controller(OWNER_ROUTE_GROUP)
export class PropertyAuthorizedOwnerController {
  constructor(private readonly propertyAuthorizedOwnerService: PropertyAuthorizedOwnerService) {}

  @ApiOperation({ operationId: 'Create', description: '' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Post()
  async create(
    @Req() req: RequestType,
    @Body() dto: CreatePropertyAuthorizedOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyAuthorizedOwnerService.create(dto);

    return { result, messageCode: 'CREATE' };
  }

  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPropertyAuthorizedOwnerDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyAuthorizedOwnerService.findAll(dto);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get(':propertyAuthorizedId')
  async findOne(
    @Req() req: RequestType,
    @Param('propertyAuthorizedId', ParseIntPipe) propertyAuthorizedId: number,
  ): Promise<SuccessResponseArgs> {
    const user = req.user as PartialUser;
    const result = await this.propertyAuthorizedOwnerService.findOne(propertyAuthorizedId, user.owner_id);

    return { result };
  }

  @ApiOperation({ operationId: 'Update', description: '' })
  @Put(':propertyAuthorizedId')
  async update(
    @Req() req: RequestType,
    @Param('propertyAuthorizedId', ParseIntPipe) propertyAuthorizedId: number,
    @Body() dto: UpdatePropertyAuthorizedOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const user = req.user as PartialUser;

    const authoriezed = await this.propertyAuthorizedOwnerService.findOne(
      propertyAuthorizedId,
      user.owner_id,
    );
    if (authoriezed.status === PropertyAuthorizeStatuses.APPROVED)
      throw new BadRequestException('PROPERTY_AUTH1');

    const result = await this.propertyAuthorizedOwnerService.update(propertyAuthorizedId, dto);

    return { result, messageCode: 'UPDATE' };
  }

  // @ApiOperation({ operationId: 'Remove', description: '' })
  // @Delete(':propertyAuthorizedId')
  // async remove(@Param('propertyAuthorizedId', ParseIntPipe) propertyAuthorizedId: number): Promise<SuccessResponseArgs> {
  //   await this.propertyAuthorizedOwnerService.findOne(propertyAuthorizedId);
  //   await this.propertyAuthorizedOwnerService.remove(propertyAuthorizedId);

  //   return { messageCode: 'DELETE' };
  // }
}
