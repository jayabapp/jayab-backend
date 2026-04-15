import {
  Body,
  Controller,
  ForbiddenException,
  // Delete,
  Get,
  Header,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { USER_ROUTE_GROUP } from 'src/property/common/route-group.constant';
import { PropertyUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllPropertyUserDto, PropertySearchSuggestuibUserDto } from './dto/find-all.dto';
import { ProfileUserService } from 'src/profile/roles/user/profile-user.service';
import { FindAdvisorShareDto, GenerateAdvisorShareDto } from './dto/advisor-share.dto';
import { PropertyOwnerService } from '../owner/owner.service';
import { RequestType } from 'src/common/interfaces/user.interface';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FIVE_MINUTES_TTL } from 'src/common/utils/constants/cache-ttl.constant';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { User } from '@prisma/client';
import { InjectQueue } from '@nestjs/bull';
import { CALL_LOG_JOB, CALL_LOG_QUEUE } from 'src/property/processors/queue-name.constants';
import { Queue } from 'bull';

@ApiTags('Property - USER')
// @UseGuards(UserJwtGuard)
// @ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class PropertyUserController {
  constructor(
    @InjectQueue(CALL_LOG_QUEUE) private readonly callLogQueue: Queue,
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
  ): Promise<SuccessResponseArgs> {
    const user = req.user as unknown as User;

    const result = await this.propertyUserService.findContactInfo(propertySlug);

    if (result.list?.length > 0) {
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
  async searchSuggestions(@Query() dto: PropertySearchSuggestuibUserDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyUserService.searchSuggestions(dto);
    return { result };
  }
}
