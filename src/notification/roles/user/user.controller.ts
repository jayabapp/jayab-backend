import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { USER_NOTIFICATION_ROUTE_GROUP } from 'src/notification/common/route-group.constant';
import { FindAllNotificationSharedDto } from '../shared/dto/find-all.dto';
import { NotificationSharedService } from '../shared/shared.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { RequestType } from 'src/common/interfaces/user.interface';
import { UserRole } from 'src/common/interfaces/role.enum';

@ApiTags('Notification - USER')
@UseGuards(UserJwtGuard)
@ApiBearerAuth('user-jwt')
@Controller(USER_NOTIFICATION_ROUTE_GROUP)
export class NotificationUserController {
  constructor(private readonly notificationSharedService: NotificationSharedService) {}

  @ApiOperation({ summary: 'Find All', description: '', operationId: 'notificationUserFindAll' })
  @Get()
  async findAll(
    @Req() req: RequestType,
    @Query() dto: FindAllNotificationSharedDto,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;
    const result = await this.notificationSharedService.findAll(user, dto, UserRole.USER);
    return { result };
  }

  @ApiOperation({ summary: 'Badge count', operationId: 'notificationUserBadgeCount' })
  @Get('badge')
  async getBadgeCount(@Req() req: RequestType): Promise<SuccessResponseArgs> {
    const user = req.user;
    const result = await this.notificationSharedService.findBadgeCount(
      user,
      user.notification_read_at,
      UserRole.USER,
    );
    return { result };
  }
}
