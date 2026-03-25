import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  UseGuards,
  BadRequestException,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CityAdminService } from './city-admin.service';
import { CreateCityAdminDto } from './dto/create-city-admin.dto';
import { UpdateCityAdminDto } from './dto/update-city-admin.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { CITY_ADMIN_ROUTE_GROUP } from 'src/city/common/route-group.constant';
import { FindAllCityAdminDto } from './dto/find-all.dto';
import qs from 'qs';
import { filterValidator } from 'src/city/common/helpers/filter-validator.helper';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@ApiTags('👨‍💻 City - ADMIN')
@ApiBearerAuth('user-jwt')
@UseGuards(AdminJwtGuard)
@Controller(CITY_ADMIN_ROUTE_GROUP)
export class CityAdminController {
  constructor(private readonly cityAdminService: CityAdminService) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(): Promise<SuccessResponseArgs> {
    const result = await this.cityAdminService.findModelProps();
    return { result };
  }

  @ApiOperation({ summary: 'Find all categories' })
  @Get()
  async findAll(@Query() dto: FindAllCityAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.cityAdminService.findAll(dto, dto.page, dto.per_page);
    return { result };
  }

  @ApiOperation({ summary: 'Find all parents' })
  @Get('parents')
  async findParents(): Promise<SuccessResponseArgs> {
    const result = await this.cityAdminService.findParents();
    return { result };
  }

  @ApiOperation({ summary: 'Find all cascade' })
  @Get('cascade')
  async findAllRecursively(): Promise<SuccessResponseArgs> {
    const result = await this.cityAdminService.findAllCascade();
    return { result };
  }

  @ApiOperation({ summary: 'Create' })
  @Post()
  async create(@Body() createCityAdminDto: CreateCityAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.cityAdminService.create(createCityAdminDto);

    return { result, messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Find one city' })
  @Get(':cityId')
  async findOne(@Param('cityId', ParseIntPipe) cityId: number): Promise<SuccessResponseArgs> {
    const result = await this.cityAdminService.findOne(cityId);
    return { result };
  }

  @ApiOperation({ summary: 'Find all children by parent id' })
  @Get('parents/:parentId')
  async findChildren(@Param('parentId') parentId: number | null): Promise<SuccessResponseArgs> {
    /**
     * Check parent id and find all children by parent id
     */
    const result = await this.cityAdminService.findChildren(parentId || null);
    return { result };
  }

  @ApiOperation({ summary: 'Find Last Level Categories' })
  @Get('last-levels')
  async findLastLevels(@Param('parentId') parentId: number | null): Promise<SuccessResponseArgs> {
    const result = await this.cityAdminService.findLastLevels();
    return { result };
  }

  @ApiOperation({ summary: 'Update' })
  @Put(':cityId')
  async update(
    @Param('cityId', ParseIntPipe) cityId: number,
    @Body() dto: UpdateCityAdminDto,
  ): Promise<SuccessResponseArgs> {
    /**
     * Check parent id
     */
    const city = await this.cityAdminService.findById(cityId);
    // if (city.parent_id && !dto.parent_id) throw new BadRequestException('COMMON4');
    if (city.parent_id && !dto.parent_id) dto.parent_id = city.parent_id;

    /**
     * Find city by id
     */
    await this.cityAdminService.findById(cityId);

    /**
     * Update
     */
    const result = await this.cityAdminService.update(cityId, dto);

    return { result, messageCode: 'UPDATE' };
  }

  @ApiOperation({ summary: 'Delete' })
  @Delete(':cityId')
  async remove(@Param('cityId', ParseIntPipe) cityId: number): Promise<SuccessResponseArgs> {
    /**
     * Find city by id and remove that
     */
    const city = await this.cityAdminService.findById(cityId);
    if (!city) throw new BadRequestException('COMMON4');

    const result = await this.cityAdminService.remove(cityId);
    return { result, messageCode: 'DELETE' };
  }
}
