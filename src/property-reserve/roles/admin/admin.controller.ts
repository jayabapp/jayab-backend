import {
  BadRequestException,
  Controller,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { ADMIN_ROUTE_GROUP } from 'src/property-reserve/common/route-group.constant';
import { filterValidator } from 'src/property-reserve/common/helpers/filter-validator.helper';
import { PropertyReserveAdminService } from './admin.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllPropertyReserveAdminDto } from './dto/find-all.dto';
import { AccessControlList } from '@prisma/client';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@ApiTags('👨‍💻 PropertyReserve - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class PropertyReserveAdminController {
  constructor(private readonly propertyReserveAdminService: PropertyReserveAdminService) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.propertyReserveAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPropertyReserveAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.propertyReserveAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.propertyReserveAdminService.findOne(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  // @ApiOperation({ summary: 'Remove', description: '' })
  // @Delete(':id')
  // async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
  //   await this.propertyReserveAdminService.findById(id);
  //   await this.propertyReserveAdminService.remove(id);

  //   return { messageCode: 'DELETE' };
  // }
}
