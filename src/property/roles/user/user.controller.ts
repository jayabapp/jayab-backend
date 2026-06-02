import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  ForbiddenException,
  // Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Req,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Queue } from 'bull';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { RequestType } from 'src/common/interfaces/user.interface';
import { ProfileUserService } from 'src/profile/roles/user/profile-user.service';
import { USER_ROUTE_GROUP } from 'src/property/common/route-group.constant';
import {
  CALL_LOG_JOB,
  CALL_LOG_QUEUE,
  VIEW_COUNT_JOB,
  VIEW_COUNT_QUEUE,
} from 'src/property/processors/queue-name.constants';
import { PropertyOwnerService } from '../owner/owner.service';
import { FindAdvisorShareDto, GenerateAdvisorShareDto } from './dto/advisor-share.dto';
import { FindAllPropertyUserDto, PropertySearchSuggestionUserDto } from './dto/find-all.dto';
import { PropertyUserService } from './user.service';

@ApiTags('Property - USER')
// @UseGuards(UserJwtGuard)
// @ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class PropertyUserController {
  constructor(
    @InjectQueue(CALL_LOG_QUEUE) private readonly callLogQueue: Queue,
    @InjectQueue(VIEW_COUNT_QUEUE) private readonly viewCountQueue: Queue,
    private readonly propertyUserService: PropertyUserService,
    private readonly profileUserService: ProfileUserService,
    private readonly propertyOwnerService: PropertyOwnerService,
  ) {}

  @ApiOperation({ summary: 'Find All', description: '' })
  @ApiHeader({ name: 'authorization', description: 'user-jwt', required: false })
  @Get()
  async findAll(
    @Query() dto: FindAllPropertyUserDto,
    @Headers('authorization') authorization?: string,
  ): Promise<SuccessResponseArgs> {
    /**
     * اگر مشاور باشه دیتاهای بیشتری میبینه مثل روزهای پر و خالی
     */
    const { isAdvisor } = await this.profileUserService.checkUserIsActiveAdvisor(authorization);

    const result = await this.propertyUserService.findAll(dto, isAdvisor);

    /**
     * اپدیت تعداد بازدید آگهی ها
     */
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
    /**
     * اگر مشاور باشه دیتاهای بیشتری میبینه مثل روزهای پر و خالی
     */
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
    /**
     * در توسعه فروردین ۴۰۵ مشاهده وضعیت رزرو برای همه باز شد
     */
    // const { isAdvisor } = await this.profileUserService.checkUserIsActiveAdvisor(authorization);
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
    await this.propertyUserService.updateViewStatistics(propertyId, dto.fingerprint);
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

  // @ApiOperation({ summary: 'Duplicate', description: '' })
  // @Post(':propertyId/duplicate')
  // async duplicate(@Param('propertyId') propertyId: number): Promise<SuccessResponseArgs> {
  //   const result = await this.propertyUserService.duplicate(propertyId);
  //   return { result };
  // }

  /* -------------------------------------------------------------------------- */
  /*                                    SHARE                                   */
  /* -------------------------------------------------------------------------- */
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
  /* ---------------------------- SEARCH SUGGESTION --------------------------- */
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
