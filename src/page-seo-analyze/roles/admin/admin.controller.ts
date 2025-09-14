import {
  BadRequestException,
  Body,
  Controller,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { ADMIN_ROUTE_GROUP } from 'src/page-seo-analyze/common/route-group.constant';
import { filterValidator } from 'src/page-seo-analyze/common/helpers/filter-validator.helper';
import qs from 'qs';
import { PageSeoAnalyzeAdminService } from './admin.service';
import { CreatePageSeoAnalyzeAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdatePageSeoAnalyzeAdminDto } from './dto/update.dto';
import { FindAllPageSeoAnalyzeAdminDto } from './dto/find-all.dto';
import { AccessControlList } from '@prisma/client';
import { UpdatePartialPageSeoAnalyzeAdminDto } from './dto/update-partial.dto';

@ApiTags('👨‍💻 PageSeoAnalyze - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class PageSeoAnalyzeAdminController {
  constructor(private readonly pageSeoAnalyzeAdminService: PageSeoAnalyzeAdminService) { }

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.pageSeoAnalyzeAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Scrape', description: '' })
  @Get('scrape')
  async scrapeAndCreateReport(@Query('pageId', ParseIntPipe) pageId: number): Promise<SuccessResponseArgs> {
    const result = await this.pageSeoAnalyzeAdminService.scrapAndCreateReport(pageId);

    return { result };
  }

  @ApiOperation({ summary: 'Scrape All', description: 'تغییر وضعیت همه ایتم ها به صفر' })
  @Get('scrape/all')
  async scrapeAll(): Promise<SuccessResponseArgs> {
    const result = await this.pageSeoAnalyzeAdminService.scrapeAll();

    return { result };
  }

  @ApiOperation({ summary: 'Sync Sitemap', description: '' })
  @Get('sync-sitemap')
  async syncSitemap(): Promise<SuccessResponseArgs> {
    const result = await this.pageSeoAnalyzeAdminService.syncSitemap();

    return { result, messageCode: 'COMMON6' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPageSeoAnalyzeAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.pageSeoAnalyzeAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.pageSeoAnalyzeAdminService.findOne(id);

    return { result };
  }


}
