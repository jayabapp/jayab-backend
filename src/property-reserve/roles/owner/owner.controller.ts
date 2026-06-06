import {
  Controller,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { OwnerJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OWNER_ROUTE_GROUP } from 'src/property-reserve/common/route-group.constant';
import { PropertyReserveOwnerService } from './owner.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllPropertyReserveOwnerDto } from './dto/find-all.dto';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { RequestType } from 'src/common/interfaces/user.interface';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { InjectQueue } from '@nestjs/bull';
import { RESERVE_QUEUE } from 'src/property-reserve/processors/queue-name.constants';
import { Queue } from 'bull';

@ApiTags('PropertyReserve - OWNER')
@UseGuards(UserJwtGuard, OwnerGuard)
@ApiBearerAuth('user-jwt')
@Controller(OWNER_ROUTE_GROUP)
export class PropertyReserveOwnerController {
  constructor(private readonly propertyReserveOwnerService: PropertyReserveOwnerService) {}

  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(
    @Req() req: RequestType,
    @Query() dto: FindAllPropertyReserveOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;
    const result = await this.propertyReserveOwnerService.findAll(dto, user.owner_id);

    return { result };
  }

  @ApiOperation({ summary: 'Click On Guest Mobile', description: '' })
  @Post(':propertyReserveId/events/click-guest-mobile')
  async clickGuestMobile(
    @Req() req: RequestType,
    @Param('propertyReserveId', ParseIntPipe) propertyReserveId: number,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;
    await this.propertyReserveOwnerService.clickGuestMobile(propertyReserveId);
    return;
  }

  @ApiOperation({ summary: 'Badge Count', description: '' })
  @Get('badge-count')
  async findBadgeCount(@Req() req: RequestType): Promise<SuccessResponseArgs> {
    const user = req.user;
    const result = await this.propertyReserveOwnerService.countAllActive(user.owner_id);

    return { result };
  }
}
