import { Controller, Get, UseGuards, Query, Req, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ADMIN_NOTIFICATION_ROUTE_GROUP } from 'src/notification/common/route-group.constant';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AdminRequestType, AdminType } from 'src/common/interfaces/user.interface';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { FindAllNotificationAdminDto } from './dto/find-all.dto';
import { NotificationAdminService } from './admin.service';

@ApiTags('Notification - ADMIN')
@ApiBearerAuth('admin-jwt')
@UseGuards(AdminJwtGuard)
@Controller(ADMIN_NOTIFICATION_ROUTE_GROUP)
export class NotificationAdminController {
  constructor(private readonly notificationAdminService: NotificationAdminService) {}

  @ApiOperation({ operationId: 'Find all' })
  @Get()
  async findAll(
    @Req() req: AdminRequestType,
    @Query() dto: FindAllNotificationAdminDto,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user as AdminType;
    const result = await this.notificationAdminService.findAll(admin.id, dto);
    return { result };
  }

  @ApiOperation({ operationId: 'Badge count' })
  @Get('badge')
  async getBadgeCount(@Req() req: AdminRequestType): Promise<SuccessResponseArgs> {
    const admin = req.user as AdminType;
    const result = await this.notificationAdminService.findBadgeCount(admin.id);

    return { result };
  }

  @ApiOperation({ operationId: 'Update seen all' })
  @Patch('seen-all')
  async updateSeenAll(@Req() req: AdminRequestType): Promise<SuccessResponseArgs> {
    const admin = req.user as AdminType;
    await this.notificationAdminService.updateSeenAll(admin.id);
    return;
  }

  @ApiOperation({ operationId: 'Update seen at' })
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
