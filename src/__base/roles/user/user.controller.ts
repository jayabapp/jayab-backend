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
// import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/__base/common/route-group.constant';
import { BaseUserService } from './user.service';
import { CreateBaseUserDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateBaseUserDto } from './dto/update.dto';
import { FindAllBaseUserDto } from './dto/find-all.dto';

@ApiTags('Base - USER')
// @UseGuards(UserJwtGuard)
// @ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class BaseUserController {
  constructor(private readonly baseUserService: BaseUserService) {}

  @ApiOperation({ summary: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreateBaseUserDto): Promise<SuccessResponseArgs> {
    const result = await this.baseUserService.create(dto);

    return { result, messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllBaseUserDto): Promise<SuccessResponseArgs> {
    const result = await this.baseUserService.findAll(dto);

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':baseId')
  async findOne(@Param('baseId', ParseIntPipe) baseId: number): Promise<SuccessResponseArgs> {
    const result = await this.baseUserService.findOne(baseId);

    return { result };
  }

  @ApiOperation({ summary: 'Update', description: '' })
  @Put(':baseId')
  async update(
    @Param('baseId', ParseIntPipe) baseId: number,
    @Body() dto: UpdateBaseUserDto,
  ): Promise<SuccessResponseArgs> {
    await this.baseUserService.findOne(baseId);
    const result = await this.baseUserService.update(baseId, dto);

    return { result, messageCode: 'UPDATE' };
  }

  // @ApiOperation({ summary: 'Remove', description: '' })
  // @Delete(':baseId')
  // async remove(@Param('baseId', ParseIntPipe) baseId: number): Promise<SuccessResponseArgs> {
  //   await this.baseUserService.findOne(baseId);
  //   await this.baseUserService.remove(baseId);

  //   return { messageCode: 'DELETE' };
  // }
}
