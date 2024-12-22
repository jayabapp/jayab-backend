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
import { ADMIN_ROUTE_GROUP } from 'src/content-category/common/route-group.constant';
import { ContentCategoryAdminService } from './admin.service';
import { CreateContentCategoryAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateContentCategoryAdminDto, UpdateContentCategoryDynamicFieldsAdminDto } from './dto/update.dto';
import { FindAllContentCategoryAdminDto } from './dto/find-all.dto';
import qs from 'qs';
import { ShowProps } from 'src/common/interfaces/model-props.interface';
import { AccessControlList } from '@prisma/client';
import { filterValidator } from 'src/content-category/common/helpers/filter-validator.helper';

@ApiTags('👨‍💻 ContentCategory - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class ContentCategoryAdminController {
  constructor(private readonly contentCategoryAdminService: ContentCategoryAdminService) {}

  @ApiOperation({ operationId: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreateContentCategoryAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.contentCategoryAdminService.create(dto);

    return { result, messageCode: 'CREATE' };
  }

  /* -------------------------------- FIND ALL -------------------------------- */
  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Req() req, @Query() dto: FindAllContentCategoryAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.contentCategoryAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ operationId: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;

    const result = await this.contentCategoryAdminService.findModelProps(rbac);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.contentCategoryAdminService.findOne(id);

    return { result };
  }

  @ApiOperation({ operationId: 'Update', description: '' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContentCategoryAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.contentCategoryAdminService.findById(id);
    const result = await this.contentCategoryAdminService.update(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  @ApiOperation({ operationId: 'Remove', description: '' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    await this.contentCategoryAdminService.findById(id);
    await this.contentCategoryAdminService.remove(id);

    return { messageCode: 'DELETE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                               DYNAMIC FIELDS                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Update Dynamic fields' })
  @Post(':id/dynamic-fields')
  async updateDynamicFields(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContentCategoryDynamicFieldsAdminDto,
  ): Promise<SuccessResponseArgs> {
    const item = await this.contentCategoryAdminService.findById(id);
    const result = await this.contentCategoryAdminService.updateDynamicFields(id, dto, item);

    return { result, messageCode: 'UPDATE' };
  }
  @ApiOperation({ operationId: 'Update Dynamic fields' })
  @Delete(':id/dynamic-fields/:key')
  async removeDynamicFields(
    @Param('id', ParseIntPipe) id: number,
    @Param('key') key: string,
  ): Promise<SuccessResponseArgs> {
    const item = await this.contentCategoryAdminService.findById(id);
    const result = await this.contentCategoryAdminService.removeDynamicFields(id, key, item);

    return { result, messageCode: 'UPDATE' };
  }
}
