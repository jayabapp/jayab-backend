import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessControlList } from '@prisma/client';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AdminRequestType } from 'src/common/interfaces/user.interface';
import { filterValidator } from 'src/property-photo-upgrade-request/common/helpers/filter-validator.helper';
import { ADMIN_ROUTE_GROUP } from 'src/property-photo-upgrade-request/common/route-group.constant';
import { PropertyPhotoUpgradeRequestAdminService } from './admin.service';
import { FindAllPropertyPhotoUpgradeRequestAdminDto } from './dto/find-all.dto';
import { UpdatePropertyPhotoUpgradeRequestItemAdminDto } from './dto/update-item.dto';

@ApiTags('👨‍💻 PropertyPhotoUpgradeRequest - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class PropertyPhotoUpgradeRequestAdminController {
  constructor(
    private readonly propertyPhotoUpgradeRequestAdminService: PropertyPhotoUpgradeRequestAdminService,
  ) {}

  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.propertyPhotoUpgradeRequestAdminService.findModelProps(rbac);
    return { result };
  }

  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPropertyPhotoUpgradeRequestAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.propertyPhotoUpgradeRequestAdminService.findAll(
      filterQuery,
      dto.page,
      dto.per_page,
    );

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.propertyPhotoUpgradeRequestAdminService.findOne(id);

    return { result };
  }

  @ApiOperation({ summary: 'Update Photo Upgrade Request Image Status', description: '' })
  @Patch(':requestId/images/:itemId')
  async updateRequestItem(
    @Req() req: AdminRequestType,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdatePropertyPhotoUpgradeRequestItemAdminDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyPhotoUpgradeRequestAdminService.updateRequestItem(
      req.user.id,
      requestId,
      itemId,
      dto,
    );

    return { result, messageCode: 'UPDATE' };
  }
}
