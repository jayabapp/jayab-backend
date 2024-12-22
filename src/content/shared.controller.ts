import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import { SHARED_ROUTE_GROUP } from 'src/content/common/route-group.constant';
import { ContentSharedService } from './shared.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllContentSharedDto } from './dto/find-all.dto';
import { THREE_MINUTES_TTL } from 'src/common/utils/constants/cache-ttl.constant';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Content - SHARED')
@Controller(SHARED_ROUTE_GROUP)
export class ContentSharedController {
  constructor(private readonly contentSharedService: ContentSharedService) {}

  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllContentSharedDto): Promise<SuccessResponseArgs> {
    const result = await this.contentSharedService.findAll(dto);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get(':contentId')
  async findOne(@Param('contentId', ParseIntPipe) contentId: number): Promise<SuccessResponseArgs> {
    const result = await this.contentSharedService.findOne(contentId);

    return { result };
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(THREE_MINUTES_TTL)
  @ApiOperation({ operationId: 'Find One by key', description: '' })
  @Get('by-key/:contentKey')
  async findOneByKey(@Param('contentKey') contentKey: string): Promise<SuccessResponseArgs> {
    const result = await this.contentSharedService.findOneByKey(contentKey);

    return { result };
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(THREE_MINUTES_TTL)
  @ApiOperation({ operationId: 'Find One By Slug', description: '' })
  @Get('by-slug/:slug')
  async findOneBySlug(@Param('slug') slug: string): Promise<SuccessResponseArgs> {
    if (!slug) throw new NotFoundException('NOT_FOUND_CONTENT');
    const result = await this.contentSharedService.findOneBySlug(slug);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One Category', description: '' })
  @Get('category/:categoryKey')
  async findOneCategory(@Param('categoryKey') categoryKey: string): Promise<SuccessResponseArgs> {
    const result = await this.contentSharedService.findOneCategory(categoryKey);

    return { result };
  }
}
