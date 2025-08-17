import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { ADMIN_ROUTE_GROUP } from 'src/banner/common/route-group.constant';
import { BannerAdminService } from './admin.service';
import { CreateBannerAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateBannerAdminDto } from './dto/update.dto';
import { FindAllBannerAdminDto } from './dto/find-all.dto';
import qs from 'qs';
import { AccessControlList } from '@prisma/client';
import { filterValidator } from 'src/banner/common/helpers/filter-validator.helper';

@ApiTags('👨‍💻 Banner - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class BannerAdminController {
  constructor(private readonly bannerAdminService: BannerAdminService) {}

  /* --------------------------------- CREATE --------------------------------- */
  @ApiOperation({ summary: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreateBannerAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.bannerAdminService.create(dto);

    return { result, messageCode: 'CREATE' };
  }

  /* -------------------------------- FIND ALL -------------------------------- */
  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Req() req, @Query() dto: FindAllBannerAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.bannerAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  /* ------------------------------- MODEL PROPS ------------------------------ */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;

    const result = await this.bannerAdminService.findModelProps(rbac);

    return { result };
  }

  /* -------------------------------- FIND ONE -------------------------------- */
  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.bannerAdminService.findOne(id);

    return { result };
  }

  /* --------------------------------- UPDATE --------------------------------- */
  @ApiOperation({ summary: 'Update', description: '' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBannerAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.bannerAdminService.findById(id);
    const result = await this.bannerAdminService.update(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* --------------------------------- REMOVE --------------------------------- */
  @ApiOperation({ summary: 'Remove', description: '' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    await this.bannerAdminService.findById(id);
    await this.bannerAdminService.remove(id);

    return { messageCode: 'DELETE' };
  }
}
