import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AttachmentService } from 'src/attachment/attachment.service';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UserRole } from 'src/common/interfaces/role.enum';
import { RequestType } from 'src/common/interfaces/user.interface';
import { NotificationTypes } from 'src/firebase/constants/notif-types';
import { NotificationSharedService } from 'src/notification/roles/shared/shared.service';
import {
  OwnerUpdatePropertyInterceptor,
  PropertyInterceptorData,
} from 'src/property/common/interceptors/owner-property.interceptor';
import { OWNER_ROUTE_GROUP } from 'src/property/common/route-group.constant';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { FindLastInitPropertyOwnerDto } from './dto/find-last-init.dto';
import {
  PaySubscriptionPropertyOwnerDto,
  PhotoUpgradeCheckoutSummaryDto,
  PhotoUpgradeQuotePropertyOwnerDto,
} from './dto/pay-subscription.dto';
import {
  UpdatePropertyBedroomOwnerDto,
  UpdatePropertyCommissionOwnerDto,
  UpdatePropertyEnvOwnerDto,
  UpdatePropertyFacilityOwnerDto,
  UpdatePropertyLocationOwnerDto,
  UpdatePropertyMediaOwnerDto,
  UpdatePropertyOwnerAssistantOwnerDto,
  UpdatePropertyPriceOwnerDto,
  UpdatePropertyStepOneOwnerDto,
  UpdatePropertyTermsOwnerDto,
} from './dto/update-property.dto';
import { PropertyOwnerService } from './owner.service';

@ApiTags('Property - OWNER')
@UseGuards(UserJwtGuard, OwnerGuard)
@ApiBearerAuth('user-jwt')
@Controller(OWNER_ROUTE_GROUP)
export class PropertyOwnerController {
  constructor(
    private readonly propertyOwnerService: PropertyOwnerService,
    private readonly attachmentService: AttachmentService,
    private readonly notificationService: NotificationSharedService,
  ) {}

  @ApiOperation({ summary: 'Get last init prop', description: '' })
  @Get('init')
  async getLastInit(
    @Req() req: RequestType,
    @Query() dto: FindLastInitPropertyOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;
    const result = await this.propertyOwnerService.findLastInitProp(user.owner_id, dto.property_id);
    return { result };
  }

  @ApiOperation({ summary: 'Create', description: '' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Put(':propertyId')
  async create(
    @Req() req: RequestType,
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyStepOneOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const property = req.interceptor_data as PropertyInterceptorData;
    await this.propertyOwnerService.updateInit(property, dto);
    return {};
  }

  @ApiOperation({ summary: 'Update property: location' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Put(':propertyId/location')
  async updateLocation(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyLocationOwnerDto,
  ) {
    await this.propertyOwnerService.updateLocation(propertyId, dto);
    return { messageCode: 'CREATE' };
  }

  /* ---------------------------------- MEDIA --------------------------------- */
  @ApiOperation({ summary: 'Update property: media' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Put(':propertyId/media')
  async updateMedia(
    @Req() req: RequestType,
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyMediaOwnerDto,
  ) {
    const user = req.user;
    const property = req.interceptor_data as PropertyInterceptorData;

    // check images and video
    // await this.attachmentService.validateFileOwner(dto.images, user.id, 1);//TODO: uncomment
    if (!dto.images.includes(dto.feature_image_id)) throw new BadRequestException('PROPERTY_IMAGES1');
    // if (dto.video_id) await this.attachmentService.validateFileOwner([dto.video_id], user.id, 2);

    //
    await this.propertyOwnerService.updateMedia(property, dto);
    return { messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Update property: environment' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Put(':propertyId/environment')
  async updateEnvironment(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyEnvOwnerDto,
  ) {
    await this.propertyOwnerService.updateEnvironment(propertyId, dto);
    return { messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Update property: bedroom' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Put(':propertyId/bedroom')
  async updateBedroom(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyBedroomOwnerDto,
  ) {
    await this.propertyOwnerService.updateBedroom(propertyId, dto);
    return { messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Update property: facility' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Put(':propertyId/facility')
  updateFacility(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyFacilityOwnerDto,
  ) {
    this.propertyOwnerService.updateFacility(propertyId, dto);
    return { messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Update property: price' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Put(':propertyId/price')
  updatePrices(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyPriceOwnerDto,
  ) {
    this.propertyOwnerService.updatePrices(propertyId, dto);
    return { messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Update property: assistant' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Put(':propertyId/assistants')
  async updateAssistant(
    @Req() req: RequestType,
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyOwnerAssistantOwnerDto,
  ) {
    const { user } = req;
    await this.propertyOwnerService.updateAssistant(user, propertyId, dto);
    return { messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Update property: terms' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Put(':propertyId/terms')
  async updateTerms(
    @Req() req: RequestType,
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyTermsOwnerDto,
  ) {
    const { user } = req;
    const property = req.interceptor_data as PropertyInterceptorData;
    await this.propertyOwnerService.updateTerms(property, dto);

    /* -------------------------------------------------------------------------- */
    // send notif to admin
    if (property.status == PropertyStatuses.IN_PROCESS && !property.check_in_hour)
      await this.notificationService.createNotification({
        user: { id: null, role: UserRole.ADMIN },
        mustSendNotif: true,
        notification: {
          title: 'ملک جدید',
          body: `ملک جدیدی با عنوان ${property.title} ثبت و منتظر تایید است`,
        },
        notificationType: NotificationTypes.OWNER_PROPERTY,
        notificationableId: property.id.toString(),
      });
    return { messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Update Commission' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Put(':propertyId/commission')
  async updateCommission(
    @Req() req: RequestType,
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyCommissionOwnerDto,
  ) {
    const property = req.interceptor_data as PropertyInterceptorData;
    await this.propertyOwnerService.updateCommission(property.id, dto);
    return { result: dto.advisor_commission, messageCode: 'UPDATE' };
  }

  @ApiOperation({ summary: 'Pay Subscription' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Put(':propertyId/pay-subscription')
  async paySubscription(
    @Req() req: RequestType,
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: PaySubscriptionPropertyOwnerDto,
  ) {
    const user = req.user;
    const property = req.interceptor_data as PropertyInterceptorData;

    //
    const result = await this.propertyOwnerService.paySubscription(user, property, dto);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                PHOTO UPGRADE                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Checkout summary for subscription and photo upgrade service' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Post(':propertyId/photo-upgrade-service/checkout-summary')
  async photoUpgradeCheckoutSummary(
    @Req() req: RequestType,
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: PhotoUpgradeCheckoutSummaryDto,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;
    const property = req.interceptor_data as PropertyInterceptorData;
    const result = await this.propertyOwnerService.buildPhotoUpgradeCheckoutSummary(
      user.owner_id,
      property,
      dto,
    );
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FIND                                    */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find All' })
  @Get()
  async findAll(@Req() req: RequestType) {
    const user = req.user;
    //
    const result = await this.propertyOwnerService.findAll(user.owner_id);
    return { result };
  }

  @ApiOperation({ summary: 'Find One' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Get(':propertyId')
  async findOne(@Param('propertyId', ParseIntPipe) propertyId: number, @Req() req: RequestType) {
    const result = await this.propertyOwnerService.findOne(propertyId);
    return { result };
  }

  @ApiOperation({ summary: 'Find One Calendar' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Get(':propertyId/month-calendar')
  async findOneCalendar(
    @Req() req: RequestType,
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    const property = req.interceptor_data as PropertyInterceptorData;
    const result = await this.propertyOwnerService.findPropertyCalendar(property, month, year, false, true);
    // const peakDays =
    return { result };
  }

  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @ApiOperation({ summary: 'Find Statistics', description: '' })
  @Get(':propertyId/statistics')
  async findStatistics(
    @Req() req: RequestType,
    @Param('propertyId', ParseIntPipe) propertyId: number,
  ): Promise<SuccessResponseArgs> {
    const property = req.interceptor_data as PropertyInterceptorData;
    const result = await this.propertyOwnerService.findStatistics(propertyId);
    return { result: { statistics: result } };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Delete' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Delete(':propertyId')
  async delete(@Param('propertyId', ParseIntPipe) propertyId: number): Promise<SuccessResponseArgs> {
    const result = await this.propertyOwnerService.remove(propertyId);
    return { messageCode: 'DELETE' };
  }
}
