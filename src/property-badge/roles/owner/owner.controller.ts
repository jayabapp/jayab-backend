import {
  Body,
  Controller,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { OwnerJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OWNER_ROUTE_GROUP } from 'src/property-badge/common/route-group.constant';
import { PropertyBadgeOwnerService } from './owner.service';
import { CreatePropertyBadgeOwnerDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdatePropertyBadgeOwnerDto } from './dto/update.dto';
import { FindAllPropertyBadgeOwnerDto } from './dto/find-all.dto';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { NotificationSharedService } from 'src/notification/roles/shared/shared.service';
import { UserRole } from 'src/common/interfaces/role.enum';
import { NotificationTypes } from 'src/firebase/constants/notif-types';
import { OwnerUpdatePropertyInterceptor } from 'src/property/common/interceptors/owner-property.interceptor';

@ApiTags('PropertyBadge - OWNER')
@UseGuards(UserJwtGuard, OwnerGuard)
@ApiBearerAuth('user-jwt')
@UseInterceptors(OwnerUpdatePropertyInterceptor)
@Controller(OWNER_ROUTE_GROUP)
export class PropertyBadgeOwnerController {
  constructor(
    private readonly propertyBadgeOwnerService: PropertyBadgeOwnerService,
    private readonly notificationSharedService: NotificationSharedService,
  ) {}

  @ApiOperation({ operationId: 'Create', description: '' })
  @Post()
  async create(@Param('propertyId', ParseIntPipe) propertyId: number): Promise<SuccessResponseArgs> {
    const result = await this.propertyBadgeOwnerService.create(propertyId);

    /* ---------------------------- SEND NOTIFICATION --------------------------- */
    await this.notificationSharedService.createNotification({
      user: { id: null, role: UserRole.ADMIN },
      mustSendNotif: true,
      notification: {
        title: 'درخواست احراز ملک',
        body: `درخواست ممتاز شدن برای ملک ${result.property.title} ثبت شد`,
      },
      notificationType: NotificationTypes.NEW_PROPERTY_BADGE,
      notificationableId: result.id.toString(),
    });

    return { result, messageCode: 'CREATE' };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get()
  async findOne(@Param('propertyId', ParseIntPipe) propertyId: number): Promise<SuccessResponseArgs> {
    const result = await this.propertyBadgeOwnerService.findOne(propertyId);

    return { result };
  }
}
