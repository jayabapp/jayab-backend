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
import { ADMIN_ROUTE_GROUP } from 'src/property-authorize/common/route-group.constant';
import { filterValidator } from 'src/property-authorize/common/helpers/filter-validator.helper';
import qs from 'qs';
import { PropertyAuthorizeAdminService } from './admin.service';
import { CreatePropertyAuthorizeAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdatePropertyAuthorizeAdminDto } from './dto/update.dto';
import { FindAllPropertyAuthorizeAdminDto } from './dto/find-all.dto';
import { AccessControlList, Admin } from '@prisma/client';
import { UpdatePartialPropertyAuthorizeAdminDto } from './dto/update-partial.dto';
import { NotificationSharedService } from 'src/notification/roles/shared/shared.service';
import { UserRole } from 'src/common/interfaces/role.enum';
import { PropertyAuthorizeStatusesList } from 'src/property-authorize/common/property-authorize-status.type';
import { NotificationTypes } from 'src/firebase/constants/notif-types';
import { Request } from 'express';
import { AdminType } from 'src/common/interfaces/user.interface';
import { SmsService } from 'src/sms/sms.service';

@ApiTags('👨‍💻 PropertyAuthorize - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class PropertyAuthorizeAdminController {
  constructor(
    private readonly PropertyAuthorizeAdminService: PropertyAuthorizeAdminService,
    private readonly notificationSharedService: NotificationSharedService,
    private readonly smsService: SmsService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.PropertyAuthorizeAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPropertyAuthorizeAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.PropertyAuthorizeAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.PropertyAuthorizeAdminService.findOne(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Update', description: '' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePropertyAuthorizeAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.PropertyAuthorizeAdminService.findById(id);
    const result = await this.PropertyAuthorizeAdminService.update(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE PARTIAL                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Update Partial', description: '' })
  @Patch(':id/status')
  async updateStatus(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartialPropertyAuthorizeAdminDto,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user as AdminType;
    const au = await this.PropertyAuthorizeAdminService.findById(id);

    const result = await this.PropertyAuthorizeAdminService.updateStatus(id, admin, dto);

    /* ---------------------------- SEND NOTIFICATION --------------------------- */
    await this.notificationSharedService.createNotification({
      user: { id: au.property.owner.user.id, role: UserRole.USER },
      mustSendNotif: true,
      notification: {
        title: 'احراز ملک',
        body: `درخواست احراز ملک ${au.property.title} به وضعیت ${PropertyAuthorizeStatusesList.find((e) => e.id === dto.status)?.title} تغییر پیدا کرد`,
      },
      notificationType: NotificationTypes.OWNER_PROPERTY,
      notificationableId: id.toString(),
    });

    //send sms to owner
    const statusText = PropertyAuthorizeStatusesList.find((e) => e.id === dto.status)?.title;
    await this.smsService.sendChangePropertyAuthStatusToOwner(
      au.property.owner.user.mobile_number,
      au.property.title,
      statusText,
    );

    return { result, messageCode: 'UPDATE' };
  }
}
