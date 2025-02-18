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
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { ADMIN_ROUTE_GROUP } from 'src/property/common/route-group.constant';
import { filterValidator } from 'src/property/common/helpers/filter-validator.helper';
import { PropertyAdminService } from './admin.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllPropertyAdminDto } from './dto/find-all.dto';
import { AccessControlList } from '@prisma/client';
import { UpdatePartialPropertyAdminDto } from './dto/update-partial.dto';
import { AdminRequestType, AdminType } from 'src/common/interfaces/user.interface';
import { excelPaginationOptions } from 'src/common/helpers/excel-creator.helper';
import { SmsService } from 'src/sms/sms.service';
import { PropertyStatusesList } from 'src/property/common/types/property-status.type';
import { UpdatePropertyImagesAdminDto } from './dto/update.dto';
import { PropertyAdminMigrationService } from './admin-migration.service';

@ApiTags('👨‍💻 Property - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class PropertyAdminController {
  constructor(
    private readonly propertyAdminService: PropertyAdminService,
    private readonly propertyAdminMigrationService: PropertyAdminMigrationService,
    private readonly smsService: SmsService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.propertyAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /*                                    EXCEL                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Get Excel', description: '' })
  @Get('excel')
  async getExcel(@Query() dto: FindAllPropertyAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const list = await this.propertyAdminService.findAll(
      filterQuery,
      excelPaginationOptions.page,
      excelPaginationOptions.perPage,
    );

    const url = await this.propertyAdminService.createExcel(list.data);

    return { result: url };
  }

  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPropertyAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.propertyAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.propertyAdminService.findOne(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  // @ApiOperation({ operationId: 'Update', description: '' })
  // @Put(':id')
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() dto: UpdatePropertyAdminDto,
  // ): Promise<SuccessResponseArgs> {
  //   await this.propertyAdminService.findById(id);
  //   const result = await this.propertyAdminService.update(id, dto);

  //   return { result, messageCode: 'UPDATE' };
  // }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE PARTIAL                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Update Partial', description: '' })
  @Patch(':id')
  async updatePartial(
    @Req() req: AdminRequestType,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartialPropertyAdminDto,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user;
    const property = await this.propertyAdminService.findById(id);
    const result = await this.propertyAdminService.updatePartial(admin, id, dto);

    //send sms to owner
    const statusText = PropertyStatusesList.find((e) => e.id === dto.status)?.title;
    await this.smsService.sendChangePropertyStatusToOwner(
      property.owner.user.mobile_number,
      property.title,
      statusText,
    );

    return { result, messageCode: 'UPDATE' };
  }

  @ApiOperation({ operationId: 'Update Images', description: '' })
  @Put(':id/images')
  async updateImages(
    @Req() req: AdminRequestType,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePropertyImagesAdminDto,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user;
    const property = await this.propertyAdminService.findById(id);
    const result = await this.propertyAdminService.updateImages(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                  MIGRATION                                 */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Migrate Users', description: '' })
  @Post('migrate/users')
  async migrate(): Promise<SuccessResponseArgs> {
    await this.propertyAdminMigrationService.migrateFromV1Users();

    return {};
  }

  @ApiOperation({ operationId: 'Migrate Owners', description: '' })
  @Post('migrate/owners')
  async migrateOwners(): Promise<SuccessResponseArgs> {
    await this.propertyAdminMigrationService.migrateFromV1Owners();

    return {};
  }

  @ApiOperation({ operationId: 'Migrate Attachments', description: '' })
  @Post('migrate/attachments')
  async migrateAttachments(): Promise<SuccessResponseArgs> {
    await this.propertyAdminMigrationService.migrateFromV1Attachments();

    return {};
  }
}
