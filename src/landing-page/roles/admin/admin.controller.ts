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
import { ADMIN_ROUTE_GROUP } from 'src/landing-page/common/route-group.constant';
import { filterValidator } from 'src/landing-page/common/helpers/filter-validator.helper';
import qs from 'qs';
import { LandingPageAdminService } from './admin.service';
import { CreateLandingPageAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateLandingPageAdminDto } from './dto/update.dto';
import { FindAllLandingPageAdminDto } from './dto/find-all.dto';
import { AccessControlList } from '@prisma/client';
import { UpdatePartialLandingPageAdminDto } from './dto/update-partial.dto';

@ApiTags('👨‍💻 LandingPage - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class LandingPageAdminController {
  constructor(private readonly landingPageAdminService: LandingPageAdminService) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.landingPageAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreateLandingPageAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.landingPageAdminService.create(dto);

    return { result, messageCode: 'CREATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllLandingPageAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.landingPageAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.landingPageAdminService.findOne(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Update', description: '' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLandingPageAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.landingPageAdminService.findById(id);
    const result = await this.landingPageAdminService.update(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE PARTIAL                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Update Partial', description: '' })
  @Patch(':id/update-partial')
  async updatePartial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartialLandingPageAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.landingPageAdminService.findById(id);
    const result = await this.landingPageAdminService.updatePartial(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Remove', description: '' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    await this.landingPageAdminService.findById(id);
    await this.landingPageAdminService.remove(id);

    return { messageCode: 'DELETE' };
  }
}
