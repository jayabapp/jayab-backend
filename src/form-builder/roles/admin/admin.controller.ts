import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { ADMIN_ROUTE_GROUP } from 'src/form-builder/common/route-group.constant';
import { FormBuilderAdminService } from './admin.service';
import { CreateFormBuilderAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateFormBuilderAdminDto } from './dto/update.dto';
import { FindAllFormBuilderAdminDto } from './dto/find-all.dto';
import qs from 'qs';
import { AccessControlList } from '@prisma/client';
import { filterValidator } from 'src/form-builder/common/helpers/filter-validator.helper';
import { UpdatePartialFormBuilderAdminDto } from './dto/update-partial.dto';

@ApiTags('👨‍💻 FormBuilder - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class FormBuilderAdminController {
  constructor(private readonly formBuilderAdminService: FormBuilderAdminService) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.formBuilderAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreateFormBuilderAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.formBuilderAdminService.create(dto);

    return { result, messageCode: 'CREATE' };
  }

  /* -------------------------------- FIND ALL -------------------------------- */
  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllFormBuilderAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.formBuilderAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.formBuilderAdminService.findOne(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Update', description: '' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFormBuilderAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.formBuilderAdminService.findById(id);
    const result = await this.formBuilderAdminService.update(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE PARTIAL                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Update Partial', description: '' })
  @Patch(':id/update-partial')
  async updatePartial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartialFormBuilderAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.formBuilderAdminService.findById(id);
    const result = await this.formBuilderAdminService.updatePartial(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Remove', description: '' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    await this.formBuilderAdminService.findById(id);
    await this.formBuilderAdminService.remove(id);

    return { messageCode: 'DELETE' };
  }
}
