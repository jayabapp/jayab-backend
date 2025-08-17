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
} from '@nestjs/common';
import { CategoryAdminService } from './category-admin.service';
import { CreateCategoryAdminDto } from './dto/create-category-admin.dto';
import { UpdateCategoryAdminDto } from './dto/update-category-admin.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { CATEGORY_ROUTE_GROUP } from 'src/category/common/route-group.constant';
import { FindAllCategoryAdminDto } from './dto/find-all.dto';
import qs from 'qs';
import { filterValidator } from 'src/category/common/helpers/filter-validator.helper';

@ApiTags('👨‍💻 Category - ADMIN')
@ApiBearerAuth('user-jwt')
@UseGuards(AdminJwtGuard)
@Controller(`admin/${CATEGORY_ROUTE_GROUP}`)
export class CategoryAdminController {
  constructor(private readonly categoryAdminService: CategoryAdminService) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(): Promise<SuccessResponseArgs> {
    const result = await this.categoryAdminService.findModelProps();
    return { result };
  }

  @ApiOperation({ summary: 'Find all parents' })
  @Get('parents')
  async findParents(): Promise<SuccessResponseArgs> {
    const result = await this.categoryAdminService.findParents();
    return { result };
  }

  @ApiOperation({ summary: 'Cascade' })
  @Get('cascade')
  async findAllRecursively(): Promise<SuccessResponseArgs> {
    const result = await this.categoryAdminService.findAllCascade();
    return { result };
  }

  @ApiOperation({ summary: 'Create' })
  @Post()
  async create(@Body() createCategoryAdminDto: CreateCategoryAdminDto): Promise<SuccessResponseArgs> {
    /**
     * Check parent id
     */
    // const parentCategory = await this.categoryAdminService.findById(createCategoryAdminDto.parent_id);
    // if (parentCategory.parent_id) throw new BadRequestException('COMMON4');

    /**
     * Create category
     */
    const result = await this.categoryAdminService.create(createCategoryAdminDto);

    return { result, messageCode: 'CREATE' };
  }

  // @ApiOperation({ summary: 'Find all categories', summary: 'دریافت همه دسته بندی ها' })
  // @Get()
  // async findAll(): Promise<SuccessResponseArgs> {

  //   const result = await this.categoryAdminService.findAll();
  //   return { result };
  // }

  @ApiOperation({ summary: 'Find All', description: 'دریافت همه دسته بندی ها' })
  @Get()
  async findAll(@Query() dto: FindAllCategoryAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.categoryAdminService.findAll(dto);
    return { result: result };
  }

  @ApiOperation({ summary: 'Find All Parents', description: 'دریافت همه دسته بندی های والد' })
  @Get('parents-with-query')
  async findAllParents(@Query() dto: FindAllCategoryAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.categoryAdminService.findParents([], dto);

    return { result: { data: result } };
  }
  @ApiOperation({ summary: 'Find one category' })
  @Get(':categoryId')
  async findOne(@Param('categoryId', ParseIntPipe) categoryId: number): Promise<SuccessResponseArgs> {
    const result = await this.categoryAdminService.findOne(categoryId);
    return { result };
  }

  @ApiOperation({ summary: 'Find all children by parent id' })
  @Get('parents/:parentId')
  async findChildren(@Param('parentId') parentId: number | null): Promise<SuccessResponseArgs> {
    /**
     * Check parent id and find all children by parent id
     */
    const result = await this.categoryAdminService.findChildren(parentId || null);
    return { result };
  }

  @ApiOperation({ summary: 'Find Last Level Categories' })
  @Get('last-levels')
  async findLastLevels(@Param('parentId') parentId: number | null): Promise<SuccessResponseArgs> {
    const result = await this.categoryAdminService.findLastLevels();
    return { result };
  }

  @ApiOperation({ summary: 'Update' })
  @Put(':categoryId')
  async update(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() dto: UpdateCategoryAdminDto,
  ): Promise<SuccessResponseArgs> {
    /**
     * Check parent id
     */
    const category = await this.categoryAdminService.findById(categoryId);
    if (category.parent_id && !dto.parent_id) throw new BadRequestException('COMMON4');

    /**
     * Find category by id
     */
    await this.categoryAdminService.findById(categoryId);

    /**
     * Update
     */
    const result = await this.categoryAdminService.update(categoryId, dto);

    return { result, messageCode: 'UPDATE' };
  }

  @ApiOperation({ summary: 'Delete' })
  @Delete(':categoryId')
  async remove(@Param('categoryId', ParseIntPipe) categoryId: number): Promise<SuccessResponseArgs> {
    /**
     * Find category by id and remove that
     */
    const category = await this.categoryAdminService.findById(categoryId);
    if (!category) throw new BadRequestException('COMMON4');

    const result = await this.categoryAdminService.remove(categoryId);
    return { result, messageCode: 'DELETE' };
  }
}
