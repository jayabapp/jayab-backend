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
import { ADMIN_ROUTE_GROUP } from 'src/advisor/common/route-group.constant';
import { filterValidator } from 'src/advisor/common/helpers/filter-validator.helper';
import qs from 'qs';
import { AdvisorAdminService } from './admin.service';
import { CreateAdvisorAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateAdvisorAdminDto } from './dto/update.dto';
import { FindAllAdvisorAdminDto } from './dto/find-all.dto';
import { AccessControlList } from '@prisma/client';
import { UpdatePartialAdvisorAdminDto } from './dto/update-partial.dto';
import { AdminRequestType } from 'src/common/interfaces/user.interface';
import { excelPaginationOptions } from 'src/common/helpers/excel-creator.helper';
import { NotificationSharedService } from 'src/notification/roles/shared/shared.service';
import { UserRole } from 'src/common/interfaces/role.enum';
import { AdvisorStatusList } from 'src/advisor/common/advisor-status.type';
import { NotificationTypes } from 'src/firebase/constants/notif-types';

@ApiTags('👨‍💻 Advisor - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class AdvisorAdminController {
  constructor(
    private readonly advisorAdminService: AdvisorAdminService,
    private readonly notificationSharedService: NotificationSharedService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.advisorAdminService.findModelProps(rbac);
    return { result };
  }

  // /* -------------------------------------------------------------------------- */
  // /*                                   CREATE                                   */
  // /* -------------------------------------------------------------------------- */
  // @ApiOperation({ summary: 'Create', description: '' })
  // @Post()
  // async create(@Body() dto: CreateAdvisorAdminDto): Promise<SuccessResponseArgs> {
  //   const result = await this.advisorAdminService.create(dto);

  //   return { result, messageCode: 'CREATE' };
  // }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllAdvisorAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.advisorAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ summary: 'Get Excel', description: '' })
  @Get('excel')
  async getExcel(@Query() dto: FindAllAdvisorAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const list = await this.advisorAdminService.findAll(
      filterQuery,
      excelPaginationOptions.page,
      excelPaginationOptions.perPage,
    );

    const url = await this.advisorAdminService.createExcel(list);

    return { result: url };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.advisorAdminService.findOne(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Update', description: '' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdvisorAdminDto,
  ): Promise<SuccessResponseArgs> {
    const advisor = await this.advisorAdminService.findById(id);
    const result = await this.advisorAdminService.update(advisor, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE PARTIAL                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Update Partial', description: '' })
  @Patch(':id/update-partial')
  async updatePartial(
    @Req() req: AdminRequestType,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartialAdvisorAdminDto,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user;
    const advisor = await this.advisorAdminService.findById(id);
    const result = await this.advisorAdminService.updatePartial(admin, id, dto);

    /* SEND NOTIFICATION */
    let notifBody = `وضعیت ثبت نام شما به عنوان مشاور ویژه در جایاب به ${AdvisorStatusList.find((e) => e.id === dto.status)?.title} تغییر پیدا کرد`;
    if (dto.admin_description) notifBody += `\n ${dto.admin_description}`;

    await this.notificationSharedService.createNotification({
      user: { id: advisor.user?.id, role: UserRole.USER },
      mustSendNotif: true,
      notification: {
        title: 'تغییر وضعیت مشاور',
        body: notifBody,
      },
      notificationType: NotificationTypes.ADVISOR_SUBSCRIPTION,
      notificationableId: id?.toString(),
    });
    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  // @ApiOperation({ summary: 'Remove', description: '' })
  // @Delete(':id')
  // async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
  //   await this.advisorAdminService.findById(id);
  //   await this.advisorAdminService.remove(id);

  //   return { messageCode: 'DELETE' };
  // }
}
