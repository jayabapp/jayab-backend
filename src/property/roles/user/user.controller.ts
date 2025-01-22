import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { USER_ROUTE_GROUP } from 'src/property/common/route-group.constant';
import { PropertyUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllPropertyUserDto } from './dto/find-all.dto';
import { ProfileUserService } from 'src/profile/roles/user/profile-user.service';
import { PropertyOwnerService } from '../owner/owner.service';

@ApiTags('Property - USER')
// @UseGuards(UserJwtGuard)
// @ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class PropertyUserController {
  constructor(
    private readonly propertyUserService: PropertyUserService,
    private readonly profileUserService: ProfileUserService,
    private readonly propertyOwnerService: PropertyOwnerService,
  ) {}

  @ApiOperation({ operationId: 'Find All', description: '' })
  @ApiHeader({ name: 'authorization', description: 'user-jwt', required: false })
  @Get()
  async findAll(
    @Query() dto: FindAllPropertyUserDto,
    @Headers('authorization') authorization?: string,
  ): Promise<SuccessResponseArgs> {
    /**
     * اگر مشاور باشه دیتاهای بیشتری میبینه مثل روزهای پر و خالی
     */
    const isAdvisor = await this.profileUserService.checkUserIsActiveAdvisor(authorization);

    const result = await this.propertyUserService.findAll(dto, isAdvisor);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One By Slug', description: '' })
  @ApiHeader({ name: 'authorization', description: 'user-jwt', required: false })
  @Get(':propertySlug')
  async findOne(
    @Param('propertySlug') propertySlug: string,
    @Headers('authorization') authorization?: string,
  ): Promise<SuccessResponseArgs> {
    /**
     * اگر مشاور باشه دیتاهای بیشتری میبینه مثل روزهای پر و خالی
     */
    const isAdvisor = await this.profileUserService.checkUserIsActiveAdvisor(authorization);

    const result = await this.propertyUserService.findOne(propertySlug, isAdvisor);
    return { result };
  }

  @ApiOperation({ operationId: 'Find One Calendar' })
  @Get(':propertyId/month-calendar')
  async findOneCalendar(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    const property = await this.propertyUserService.findById(propertyId);
    const result = await this.propertyOwnerService.findPropertyCalendar(property, month, year, true);
    // const peakDays =
    return { result };
  }

  @ApiOperation({ operationId: 'Update View', description: '' })
  @Put(':propertyId/view')
  async updateView(
    @Param('propertyId') propertyId: number,
    @Body() dto: { fingerprint: string },
  ): Promise<SuccessResponseArgs> {
    await this.propertyUserService.updateViewStatistics(propertyId, dto.fingerprint);
    return {};
  }

  @ApiOperation({ operationId: 'Find Contact Info', description: '' })
  @Get(':propertySlug/contact-info')
  async findContactInfo(@Param('propertySlug') propertySlug: string): Promise<SuccessResponseArgs> {
    const result = await this.propertyUserService.findContactInfo(propertySlug);
    return { result };
  }

  @ApiOperation({ operationId: 'Duplicate', description: '' })
  @Post(':propertyId/duplicate')
  async duplicate(@Param('propertyId') propertyId: number): Promise<SuccessResponseArgs> {
    const result = await this.propertyUserService.duplicate(propertyId);
    return { result };
  }
}
