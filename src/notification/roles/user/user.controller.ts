import { Body, Controller, Get, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/__base/common/route-group.constant';
import { NotificationUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllNotificationUserDto } from './dto/find-all.dto';
import { UserRole } from 'src/common/interfaces/role.enum';
import { UserType, RequestType } from 'src/common/interfaces/user.interface';
import { NotificationSharedService } from '../shared/shared.service';
import { FindAllNotificationSharedDto } from '../shared/dto/find-all.dto';

@ApiTags('Notification - USER')
@UseGuards(UserJwtGuard)
@ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class NotificationUserController {
  constructor(private readonly notificationSharedService: NotificationSharedService) {}

  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(
    @Req() req: RequestType,
    @Query() dto: FindAllNotificationSharedDto,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;
    const result = await this.notificationSharedService.findAll(user, dto, UserRole.USER);
    return { result };
  }

  @ApiOperation({ operationId: 'Badge count' })
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

  // @ApiOperation({ operationId: 'Find One', description: '' })
  // @Get(':notifId')
  // async findOne(
  //   @Req() req: UserType,
  //   @Param('notifId', ParseIntPipe) notifId: number,
  // ): Promise<SuccessResponseArgs> {
  //   const user = req.user;
  //   const result = await this.baseUserService.findOne(user.id, UserRole.USER, notifId);

  //   return { result };
  // }
}
