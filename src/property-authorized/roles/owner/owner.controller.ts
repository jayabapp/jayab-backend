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
// import { OwnerJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/property-authorized/common/route-group.constant';
import { PropertyAuthorizedOwnerService } from './owner.service';
import { CreatePropertyAuthorizedOwnerDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdatePropertyAuthorizedOwnerDto } from './dto/update.dto';
import { FindAllPropertyAuthorizedOwnerDto } from './dto/find-all.dto';

@ApiTags('PropertyAuthorized - USER')
// @UseGuards(OwnerJwtGuard)
// @ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class PropertyAuthorizedOwnerController {
  constructor(private readonly propertyAuthorizedOwnerService: PropertyAuthorizedOwnerService) {}

  @ApiOperation({ operationId: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreatePropertyAuthorizedOwnerDto): Promise<SuccessResponseArgs> {
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
  async findOne(@Param('propertyAuthorizedId', ParseIntPipe) propertyAuthorizedId: number): Promise<SuccessResponseArgs> {
    const result = await this.propertyAuthorizedOwnerService.findOne(propertyAuthorizedId);

    return { result };
  }

  @ApiOperation({ operationId: 'Update', description: '' })
  @Put(':propertyAuthorizedId')
  async update(
    @Param('propertyAuthorizedId', ParseIntPipe) propertyAuthorizedId: number,
    @Body() dto: UpdatePropertyAuthorizedOwnerDto,
  ): Promise<SuccessResponseArgs> {
    await this.propertyAuthorizedOwnerService.findOne(propertyAuthorizedId);
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
