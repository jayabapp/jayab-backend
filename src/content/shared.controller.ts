import { Controller, Param, Query, UseInterceptors } from '@nestjs/common';
import { Get, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FindAllContentSharedDto } from './dto/find-all.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContentSharedService } from './shared.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { SHARED_ROUTE_GROUP } from 'src/content/common/route-group.constant';
import { THREE_MINUTES_TTL } from 'src/common/utils/constants/cache-ttl.constant';

@ApiTags('Content - SHARED')
@Controller(SHARED_ROUTE_GROUP)
export class ContentSharedController {
  constructor(private readonly contentSharedService: ContentSharedService) {}

  @ApiOperation({ summary: 'Find All', description: '', operationId: 'contentSharedFindAll' })
  @Get()
  async findAll(@Query() dto: FindAllContentSharedDto): Promise<SuccessResponseArgs> {
    const result = await this.contentSharedService.findAll(dto);
    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '', operationId: 'contentSharedFindOne' })
  @Get(':contentId')
  async findOne(@Param('contentId', ParseIntPipe) contentId: number): Promise<SuccessResponseArgs> {
    const result = await this.contentSharedService.findOne(contentId);
    return { result };
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(THREE_MINUTES_TTL)
  @ApiOperation({ summary: 'Find One by key', description: '', operationId: 'contentSharedFindOneByKey' })
  @Get('by-key/:contentKey')
  async findOneByKey(@Param('contentKey') contentKey: string): Promise<SuccessResponseArgs> {
    const result = await this.contentSharedService.findOneByKey(contentKey);
    return { result };
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(THREE_MINUTES_TTL)
  @ApiOperation({ summary: 'Find One By Slug', description: '', operationId: 'contentSharedFindOneBySlug' })
  @Get('by-slug/:slug')
  async findOneBySlug(@Param('slug') slug: string): Promise<SuccessResponseArgs> {
    if (!slug) throw new NotFoundException('NOT_FOUND_CONTENT');
    const result = await this.contentSharedService.findOneBySlug(slug);
    return { result };
  }

  @ApiOperation({
    summary: 'Find One Category',
    description: '',
    operationId: 'contentSharedFindOneCategory',
  })
  @Get('category/:categoryKey')
  async findOneCategory(@Param('categoryKey') categoryKey: string): Promise<SuccessResponseArgs> {
    const result = await this.contentSharedService.findOneCategory(categoryKey);
    return { result };
  }

  @ApiOperation({
    summary: 'Find One Category By Slug',
    description: '',
    operationId: 'contentSharedFindOneCategoryBySlug',
  })
  @Get('category/by-slug/:categorySlug')
  async findOneCategoryBySlug(@Param('categorySlug') categorySlug: string): Promise<SuccessResponseArgs> {
    const result = await this.contentSharedService.findOneCategoryBySlug(categorySlug);
    return { result };
  }
}
