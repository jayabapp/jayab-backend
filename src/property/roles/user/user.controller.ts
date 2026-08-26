import { Body, Controller, ForbiddenException, Get, Headers, Param } from '@nestjs/common';
import { FindAllPropertyUserDto, PropertySearchSuggestionUserDto } from './dto/find-all.dto';
import { ParseIntPipe, Put, Query, Req, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAdvisorShareDto, GenerateAdvisorShareDto } from './dto/advisor-share.dto';
import { VIEW_COUNT_JOB, VIEW_COUNT_QUEUE } from 'src/property/processors/queue-name.constants';
import { CALL_LOG_JOB, CALL_LOG_QUEUE } from 'src/property/processors/queue-name.constants';
import { PropertyOwnerService } from '../owner/owner.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { PropertyUserService } from './user.service';
import { ProfileUserService } from 'src/profile/roles/user/profile-user.service';
import { USER_ROUTE_GROUP } from 'src/property/common/route-group.constant';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { RequestType } from 'src/common/interfaces/user.interface';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@ApiTags('Property - USER')
@Controller(USER_ROUTE_GROUP)
export class PropertyUserController {
  constructor(
    @InjectQueue(CALL_LOG_QUEUE) private readonly callLogQueue: Queue,
    @InjectQueue(VIEW_COUNT_QUEUE) private readonly viewCountQueue: Queue,
    private readonly propertyUserService: PropertyUserService,
    private readonly profileUserService: ProfileUserService,
    private readonly propertyOwnerService: PropertyOwnerService,
  ) {}

  @ApiOperation({ summary: 'Find All', description: '', operationId: 'propertyUserFindAll' })
  @ApiHeader({ name: 'authorization', description: 'user-jwt', required: false })
  @Get()
  async findAll(
    @Query() dto: FindAllPropertyUserDto,
    @Headers('authorization') authorization?: string,
  ): Promise<SuccessResponseArgs> {
    const { isAdvisor } = await this.profileUserService.checkUserIsActiveAdvisor(authorization);
    const result = await this.propertyUserService.findAll(dto, isAdvisor);
    const ids = result.data?.map((e) => e.id);
    await this.viewCountQueue.add(VIEW_COUNT_JOB, { propertyIds: ids });
    return { result };
  }

  @ApiOperation({ summary: 'Find One By Slug', description: '' })
  @ApiHeader({ name: 'authorization', description: 'user-jwt', required: false })
  @Get(':propertySlug')
  async findOne(
    @Param('propertySlug') propertySlug: string,
    @Headers('authorization') authorization?: string,
  ): Promise<SuccessResponseArgs> {
    const { isAdvisor } = await this.profileUserService.checkUserIsActiveAdvisor(authorization);
    const result = await this.propertyUserService.findOne(propertySlug, isAdvisor);
    return { result };
  }

  @ApiOperation({ summary: 'Find One Calendar' })
  @ApiHeader({ name: 'authorization', description: 'user-jwt', required: false })
  @Get(':propertyId/month-calendar')
  async findOneCalendar(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Headers('authorization') authorization?: string,
  ) {
    const property = await this.propertyUserService.findById(propertyId);
    const result = await this.propertyOwnerService.findPropertyCalendar(property, month, year, true);

    return { result };
  }

  @ApiOperation({ summary: 'Find Property Reserved Days' })
  @Get(':propertyId/reserved')
  async findPropertyReservedDays(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Query('months', ParseIntPipe) months: number,
  ) {
    const result = await this.propertyUserService.findPropertyReservedDays(propertyId, months);
    return { result };
  }

  @ApiOperation({ summary: 'Update View', description: '' })
  @Put(':propertyId/view')
  async updateView(
    @Param('propertyId') propertyId: number,
    @Body() dto: { fingerprint: string },
  ): Promise<SuccessResponseArgs> {
    await this.propertyUserService.updateViewStatistics(propertyId, 1, 'view');
    return {};
  }

  @UseGuards(UserJwtGuard)
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Find Contact Info', description: '' })
  @Get(':propertySlug/contact-info')
  async findContactInfo(
    @Req() req: RequestType,
    @Param('propertySlug') propertySlug: string,
    @Query('action') action: 'view' | 'sms' | 'call',
  ): Promise<SuccessResponseArgs> {
    const user = req.user;
    const result = await this.propertyUserService.findContactInfo(propertySlug);
    if (result.list?.length > 0 && (action === 'call' || action === 'sms')) {
      const ownerMobile = result.owner.mobile;
      const propertyId = result.list[0]?.property_id;
      await this.callLogQueue.add(CALL_LOG_JOB, { propertyId, user, ownerMobile });
    }
    delete result.owner.mobile;
    return { result };
  }

  @ApiOperation({ summary: 'Generate Advisor Share Link', description: '' })
  @ApiHeader({ name: 'authorization', description: 'user-jwt', required: false })
  @Get(':propertyId/advisor-share/link')
  async generateAdvisorShare(
    @Param('propertyId') propertyId: number,
    @Query() dto: GenerateAdvisorShareDto,
    @Headers('authorization') authorization?: string,
  ): Promise<SuccessResponseArgs> {
    const { isAdvisor, advisorId } = await this.profileUserService.checkUserIsActiveAdvisor(authorization);
    if (!isAdvisor) throw new ForbiddenException('FORBIDDEN');
    const result = await this.propertyUserService.generateAdvisorShare(propertyId, advisorId, dto);
    return { result };
  }

  /**
   * اطلاعات لینک رو رمز گشایی میکنه و دیتا رو برای سایت مشاوران برمیگردونه
   * @param dto
   * @returns
   */
  @ApiOperation({ summary: 'Retrive Share Link Data', description: '' })
  @ApiHeader({ name: 'authorization', description: 'user-jwt', required: false })
  @Get(':propertyId/advisor-share')
  async findAdvisorShareData(@Query() dto: FindAdvisorShareDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyUserService.findAdvisorShareData(dto);
    return { result };
  }

  @ApiOperation({ summary: 'Search Suggestion', description: '' })
  @Get('search/suggestions')
  async searchSuggestions(@Query() dto: PropertySearchSuggestionUserDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyUserService.searchSuggestions(dto);
    return { result };
  }

  @Version('2')
  @ApiOperation({ summary: 'Search Suggestion V2', description: '' })
  @Get('search/suggestions')
  async searchSuggestionsV2(@Query() dto: PropertySearchSuggestionUserDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyUserService.searchSuggestionsV2(dto);
    return { result };
  }

  @ApiOperation({ summary: 'Search', description: '' })
  @Get('search/extract')
  async search(@Query() dto: PropertySearchSuggestionUserDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyUserService.search(dto);
    return { result };
  }
}
