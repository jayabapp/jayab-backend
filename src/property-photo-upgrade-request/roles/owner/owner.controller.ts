import { Controller, Get, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { RequestType } from 'src/common/interfaces/user.interface';
import { OWNER_ROUTE_GROUP } from 'src/property-photo-upgrade-request/common/route-group.constant';
import { FindAllPropertyPhotoUpgradeRequestOwnerDto } from './dto/find-all.dto';
import { PropertyPhotoUpgradeRequestOwnerService } from './owner.service';

@ApiTags('PropertyPhotoUpgradeRequest - OWNER')
@UseGuards(UserJwtGuard, OwnerGuard)
@ApiBearerAuth('user-jwt')
@Controller(OWNER_ROUTE_GROUP)
export class PropertyPhotoUpgradeRequestOwnerController {
  constructor(
    private readonly propertyPhotoUpgradeRequestOwnerService: PropertyPhotoUpgradeRequestOwnerService,
  ) {}

  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(
    @Req() req: RequestType,
    @Query() dto: FindAllPropertyPhotoUpgradeRequestOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyPhotoUpgradeRequestOwnerService.findAll(req.user.owner_id, dto);

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(
    @Req() req: RequestType,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyPhotoUpgradeRequestOwnerService.findOne(req.user.owner_id, id);

    return { result };
  }
}
