import {
  BadRequestException,
  Body,
  Controller,
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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessControlList } from '@prisma/client';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { filterValidator } from 'src/property-report/common/helpers/filter-validator.helper';
import { ADMIN_ROUTE_GROUP } from 'src/property-report/common/route-group.constant';
import { PropertyReportAdminService } from './admin.service';
import { CreatePropertyReportAdminDto } from './dto/create.dto';
import { FindAllPropertyReportAdminDto } from './dto/find-all.dto';
import { UpdatePartialPropertyReportAdminDto } from './dto/update-partial.dto';
import { UpdatePropertyReportAdminDto } from './dto/update.dto';

@ApiTags('👨‍💻 PropertyReport - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class PropertyReportAdminController {
  constructor(private readonly propertyReportAdminService: PropertyReportAdminService) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.propertyReportAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreatePropertyReportAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyReportAdminService.create(dto);

    return { result, messageCode: 'CREATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPropertyReportAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.propertyReportAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.propertyReportAdminService.findOne(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Update', description: '' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePropertyReportAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.propertyReportAdminService.findById(id);
    const result = await this.propertyReportAdminService.update(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE PARTIAL                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Update Partial', description: '' })
  @Patch(':id/update-partial')
  async updatePartial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartialPropertyReportAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.propertyReportAdminService.findById(id);
    const result = await this.propertyReportAdminService.updatePartial(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  // @ApiOperation({ summary: 'Remove', description: '' })
  // @Delete(':id')
  // async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
  //   await this.propertyReportAdminService.findById(id);
  //   await this.propertyReportAdminService.remove(id);

  //   return { messageCode: 'DELETE' };
  // }
}
