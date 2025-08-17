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
import { ADMIN_ROUTE_GROUP } from 'src/submitted-form/common/route-group.constant';
import { filterValidator } from 'src/submitted-form/common/helpers/filter-validator.helper';
import qs from 'qs';
import { SubmittedFormAdminService } from './admin.service';
import { CreateSubmittedFormAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateSubmittedFormAdminDto } from './dto/update.dto';
import { FindAllSubmittedFormAdminDto } from './dto/find-all.dto';
import { AccessControlList } from '@prisma/client';
import { UpdatePartialSubmittedFormAdminDto } from './dto/update-partial.dto';

@ApiTags('👨‍💻 SubmittedForm - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class SubmittedFormAdminController {
  constructor(private readonly submittedFormAdminService: SubmittedFormAdminService) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.submittedFormAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreateSubmittedFormAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.submittedFormAdminService.create(dto);

    return { result, messageCode: 'CREATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllSubmittedFormAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.submittedFormAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.submittedFormAdminService.findOne(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Update', description: '' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubmittedFormAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.submittedFormAdminService.findById(id);
    const result = await this.submittedFormAdminService.update(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE PARTIAL                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Update Partial', description: '' })
  @Patch(':id/update-partial')
  async updatePartial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartialSubmittedFormAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.submittedFormAdminService.findById(id);
    const result = await this.submittedFormAdminService.updatePartial(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  // @ApiOperation({ summary: 'Remove', description: '' })
  // @Delete(':id')
  // async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
  //   await this.submittedFormAdminService.findById(id);
  //   await this.submittedFormAdminService.remove(id);

  //   return { messageCode: 'DELETE' };
  // }
}
