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
import { ADMIN_ROUTE_GROUP } from 'src/property-badge/common/route-group.constant';
import { filterValidator } from 'src/property-badge/common/helpers/filter-validator.helper';
import qs from 'qs';
import { PropertyBadgeAdminService } from './admin.service';
import { CreatePropertyBadgeAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdatePropertyBadgeAdminDto } from './dto/update.dto';
import { FindAllPropertyBadgeAdminDto } from './dto/find-all.dto';
import { AccessControlList } from '@prisma/client';
import { UpdatePartialPropertyBadgeAdminDto } from './dto/update-partial.dto';
import { AdminType } from 'src/common/interfaces/user.interface';
import { Request } from 'express';
import { NotificationSharedService } from 'src/notification/roles/shared/shared.service';
import { UserRole } from 'src/common/interfaces/role.enum';
import { PropertyBadgeStatusList } from 'src/property-badge/common/property-badge-status.type';
import { NotificationTypes } from 'src/firebase/constants/notif-types';

@ApiTags('👨‍💻 PropertyBadge - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class PropertyBadgeAdminController {
  constructor(
    private readonly propertyBadgeAdminService: PropertyBadgeAdminService,
    private readonly notificationSharedService: NotificationSharedService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.propertyBadgeAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPropertyBadgeAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.propertyBadgeAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.propertyBadgeAdminService.findOne(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE PARTIAL                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Update Partial', description: '' })
  @Patch(':id/status')
  async updateStatus(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartialPropertyBadgeAdminDto,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user as AdminType;
    const pb = await this.propertyBadgeAdminService.findById(id);

    const result = await this.propertyBadgeAdminService.updateStatus(id, admin, dto);

    /* ---------------------------- SEND NOTIFICATION --------------------------- */
    await this.notificationSharedService.createNotification({
      user: { id: pb.property.owner.user.id, role: UserRole.USER },
      mustSendNotif: true,
      notification: {
        title: 'ممتاز شدن ملک',
        body: `درخواست ممتاز شدن ملک ${pb.property.title} به وضعیت ${PropertyBadgeStatusList.find((e) => e.id === dto.status)?.title} تغییر پیدا کرد`,
      },
      notificationType: NotificationTypes.OWNER_PROPERTY,
      notificationableId: id.toString(),
    });

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Remove', description: '' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const pb = await this.propertyBadgeAdminService.findById(id);
    await this.propertyBadgeAdminService.remove(id, pb.property_id);

    return { messageCode: 'DELETE' };
  }
}
