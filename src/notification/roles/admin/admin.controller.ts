import {
  Controller,
  Get,
  UseGuards,
  Query,
  Req,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Body,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { ADMIN_NOTIFICATION_ROUTE_GROUP } from 'src/notification/common/route-group.constant';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AdminRequestType, AdminType } from 'src/common/interfaces/user.interface';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { FindAllNotificationAdminDto, FindAllSentNotificationAdminDto } from './dto/find-all.dto';
import { NotificationAdminService } from './admin.service';
import { AccessControlList } from '@prisma/client';
import { NotificationType } from 'src/notification/common/notification-type.type';
import { CreateNotificationAdminDto } from './dto/create.dto';
import { SendNotificationAdminService } from './send-notification-admin.service';
import { filterValidator } from 'src/notification/common/helpers/filter-validator.helper';

@ApiTags('Notification - ADMIN')
@ApiBearerAuth('admin-jwt')
@UseGuards(AdminJwtGuard)
@Controller(ADMIN_NOTIFICATION_ROUTE_GROUP)
export class NotificationAdminController {
  constructor(
    private readonly notificationAdminService: NotificationAdminService,
    private readonly sendNotificationAdminService: SendNotificationAdminService,
  ) {}
  /* -------------------------------------------------------------------------- */
  /*                                    SEND                                    */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req, @Query() dto: { type: NotificationType }): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.sendNotificationAdminService.findModelProps(rbac, dto.type);
    return { result };
  }

  @ApiOperation({ summary: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreateNotificationAdminDto): Promise<SuccessResponseArgs> {
    if (dto.type == NotificationType.GROUP) await this.sendNotificationAdminService.sendToGroup(dto);
    else if (dto.type == NotificationType.MOBILE) await this.sendNotificationAdminService.sendToMobiles(dto);

    return { messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Find All Sent', description: '' })
  @Get('sent')
  async findAllSent(@Query() dto: FindAllSentNotificationAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.sendNotificationAdminService.findAllSent(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ summary: 'Delete', description: '' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    await this.sendNotificationAdminService.findById(id);
    const result = await this.sendNotificationAdminService.delete(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    PANEL                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find all' })
  @Get()
  async findAll(
    @Req() req: AdminRequestType,
    @Query() dto: FindAllNotificationAdminDto,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user as AdminType;
    const result = await this.notificationAdminService.findAll(admin.id, dto);
    return { result };
  }

  @ApiOperation({ summary: 'Badge count' })
  @Get('badge')
  async getBadgeCount(@Req() req: AdminRequestType): Promise<SuccessResponseArgs> {
    const admin = req.user as AdminType;
    const result = await this.notificationAdminService.findBadgeCount(admin.id);

    // Define an asynchronous method named 'delete' that takes a single parameter 'id' of type number and returns a Promise that resolves to void.
    return { result };
  }

  @ApiOperation({ summary: 'Update seen all' })
  @Patch('seen-all')
  async updateSeenAll(@Req() req: AdminRequestType): Promise<SuccessResponseArgs> {
    const admin = req.user as AdminType;
    await this.notificationAdminService.updateSeenAll(admin.id);
    return;
  }

  @ApiOperation({ summary: 'Update seen at' })
  @Patch('seen-at/:notifId')
  async updateSeenAt(
    @Req() req: AdminRequestType,
    @Param('notifId', ParseIntPipe) notifId: number,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user as AdminType;
    await this.notificationAdminService.updateSeenAt(admin.id, +notifId);

    return;
  }
}
