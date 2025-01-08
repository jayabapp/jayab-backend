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
import { ADMIN_ROUTE_GROUP } from 'src/peak-day/common/route-group.constant';
import { filterValidator } from 'src/peak-day/common/helpers/filter-validator.helper';
import qs from 'qs';
import { PeakDayAdminService } from './admin.service';
import { CreatePeakDayAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdatePeakDayAdminDto } from './dto/update.dto';
import { FindAllPeakDayAdminDto } from './dto/find-all.dto';
import { AccessControlList } from '@prisma/client';
import { UpdatePartialPeakDayAdminDto } from './dto/update-partial.dto';

@ApiTags('👨‍💻 PeakDay - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class PeakDayAdminController {
  constructor(private readonly peakDayAdminService: PeakDayAdminService) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.peakDayAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreatePeakDayAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.peakDayAdminService.create(dto);

    return { result, messageCode: 'CREATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPeakDayAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.peakDayAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.peakDayAdminService.findOne(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Update', description: '' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePeakDayAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.peakDayAdminService.findById(id);
    const result = await this.peakDayAdminService.update(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE PARTIAL                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Update Partial', description: '' })
  @Patch(':id/update-partial')
  async updatePartial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartialPeakDayAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.peakDayAdminService.findById(id);
    const result = await this.peakDayAdminService.updatePartial(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Remove', description: '' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    await this.peakDayAdminService.findById(id);
    await this.peakDayAdminService.remove(id);

    return { messageCode: 'DELETE' };
  }
}
