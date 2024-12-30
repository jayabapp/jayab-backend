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
import { ADMIN_ROUTE_GROUP } from 'src/owner/common/route-group.constant';
import { filterValidator } from 'src/owner/common/helpers/filter-validator.helper';
import qs from 'qs';
import { OwnerAdminService } from './admin.service';
import { CreateOwnerAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateOwnerAdminDto } from './dto/update.dto';
import { FindAllOwnerAdminDto } from './dto/find-all.dto';
import { AccessControlList } from '@prisma/client';
import { UpdatePartialOwnerAdminDto } from './dto/update-partial.dto';
import { AdminRequestType } from 'src/common/interfaces/user.interface';

@ApiTags('👨‍💻 Owner - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class OwnerAdminController {
  constructor(private readonly ownerAdminService: OwnerAdminService) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.ownerAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreateOwnerAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.ownerAdminService.create(dto);

    return { result, messageCode: 'CREATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllOwnerAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.ownerAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.ownerAdminService.findOne(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Update', description: '' })
  @Put(':id')
  async update(
    @Req() req: AdminRequestType,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartialOwnerAdminDto,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user;
    await this.ownerAdminService.findById(id);
    const result = await this.ownerAdminService.update(admin, id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE PARTIAL                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Update Partial', description: '' })
  @Patch(':id/update-partial')
  async updatePartial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartialOwnerAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.ownerAdminService.findById(id);
    const result = await this.ownerAdminService.updatePartial(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  // @ApiOperation({ operationId: 'Remove', description: '' })
  // @Delete(':id')
  // async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
  //   await this.ownerAdminService.findById(id);
  //   await this.ownerAdminService.remove(id);

  //   return { messageCode: 'DELETE' };
  // }
}
