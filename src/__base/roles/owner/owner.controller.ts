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
import { OWNER_ROUTE_GROUP } from 'src/__base/common/route-group.constant';
import { BaseOwnerService } from './owner.service';
import { CreateBaseOwnerDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateBaseOwnerDto } from './dto/update.dto';
import { FindAllBaseOwnerDto } from './dto/find-all.dto';

@ApiTags('Base - OWNER')
// @UseGuards(OwnerJwtGuard)
// @ApiBearerAuth('user-jwt')
@Controller(OWNER_ROUTE_GROUP)
export class BaseOwnerController {
  constructor(private readonly baseOwnerService: BaseOwnerService) {}

  @ApiOperation({ summary: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreateBaseOwnerDto): Promise<SuccessResponseArgs> {
    const result = await this.baseOwnerService.create(dto);

    return { result, messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllBaseOwnerDto): Promise<SuccessResponseArgs> {
    const result = await this.baseOwnerService.findAll(dto);

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':baseId')
  async findOne(@Param('baseId', ParseIntPipe) baseId: number): Promise<SuccessResponseArgs> {
    const result = await this.baseOwnerService.findOne(baseId);

    return { result };
  }

  @ApiOperation({ summary: 'Update', description: '' })
  @Put(':baseId')
  async update(
    @Param('baseId', ParseIntPipe) baseId: number,
    @Body() dto: UpdateBaseOwnerDto,
  ): Promise<SuccessResponseArgs> {
    await this.baseOwnerService.findOne(baseId);
    const result = await this.baseOwnerService.update(baseId, dto);

    return { result, messageCode: 'UPDATE' };
  }

  // @ApiOperation({ summary: 'Remove', description: '' })
  // @Delete(':baseId')
  // async remove(@Param('baseId', ParseIntPipe) baseId: number): Promise<SuccessResponseArgs> {
  //   await this.baseOwnerService.findOne(baseId);
  //   await this.baseOwnerService.remove(baseId);

  //   return { messageCode: 'DELETE' };
  // }
}
