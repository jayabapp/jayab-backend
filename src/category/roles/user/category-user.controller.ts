import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { CATEGORY_ROUTE_GROUP } from 'src/category/common/route-group.constant';
import { FindAllCategoryUserDto } from './dto/find-all-category-user.dto';
import { CategoryUserService } from './category-user.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ONE_MINUTE_TTL } from 'src/common/utils/constants/cache-ttl.constant';
import { Category } from '@prisma/client';
import { FilterCategoryUserDto } from './dto/filter-category-user.dto';
import createCategoryBreadcrumb from 'src/category/common/helpers/createBreadcrubm';

@ApiTags('Category - USER')
@Controller(CATEGORY_ROUTE_GROUP)
export class CategoryUserController {
  constructor(private readonly categoryUserService: CategoryUserService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(ONE_MINUTE_TTL)
  @ApiOperation({ summary: 'Filter' })
  @Get('/filter')
  async filter(@Query() dto: FilterCategoryUserDto): Promise<SuccessResponseArgs> {
    const result = await this.categoryUserService.filter(dto);
    return { result };
  }
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(ONE_MINUTE_TTL)
  @ApiOperation({ summary: 'Find all parents' })
  @Get('/parents')
  async findParents(): Promise<SuccessResponseArgs> {
    const result = await this.categoryUserService.findParents();
    return { result };
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(ONE_MINUTE_TTL)
  @ApiOperation({ summary: 'Find Childs' })
  @Get()
  async findAll(@Query() findAllCategoryUserDto: FindAllCategoryUserDto): Promise<SuccessResponseArgs> {
    const category = await this.categoryUserService.findById(findAllCategoryUserDto.parent_id);
    // if (category.parent_id) throw new NotFoundException('NOT_FOUND');

    const childs = await this.categoryUserService.findAll(findAllCategoryUserDto.parent_id);

    const breadcrumb = createCategoryBreadcrumb(category);

    return { result: { data: childs, category, breadcrumb: breadcrumb } };
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(ONE_MINUTE_TTL)
  @ApiOperation({ summary: 'Find Cascade' })
  @Get('cascade')
  async findAllRecursively(): Promise<SuccessResponseArgs> {
    const result = await this.categoryUserService.findAllRecursively();

    return { result };
  }

  @ApiOperation({ summary: 'Find one' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.categoryUserService.findById(id);
    return { result };
  }
}
