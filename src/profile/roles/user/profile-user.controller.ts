import { BuySubscriptionAdvisorDto, RegisterAdvisorUserDto, RegisterOwnerUserDto } from './dto/register.dto';
import { ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { Body, Controller, Delete, Get, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UpdateProfileImageUserDto } from './dto/update.dto';
import { NotificationSharedService } from 'src/notification/roles/shared/shared.service';
import { PROFILE_USER_ROUTE_GROUP } from 'src/profile/common/route-group.constant';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AdvisorUserService } from 'src/advisor/roles/user/user.service';
import { ProfileUserService } from './profile-user.service';
import { AttachmentService } from 'src/attachment/attachment.service';
import { CitySharedService } from 'src/city/shared.service';
import { FirebaseTopicType } from 'src/firebase/constants/topic-types';
import { NotificationTypes } from 'src/firebase/constants/notif-types';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { UpdateFcmDto } from 'src/profile/dto/update-profile.dto';
import { RequestType } from 'src/common/interfaces/user.interface';
import { OwnerStatus } from 'src/owner/common/owner-status.type';
import { UserRole } from 'src/common/interfaces/role.enum';

import createTopicKey from 'src/firebase/common/topic-generator.helper';

@ApiTags('Profiles - USER')
@ApiBearerAuth('user-jwt')
@UseGuards(UserJwtGuard)
@Controller(PROFILE_USER_ROUTE_GROUP)
export class ProfileUserController {
  private readonly logger = new Logger(ProfileUserController.name);

  constructor(
    private readonly profileUserService: ProfileUserService,
    private readonly attachmentService: AttachmentService,
    private readonly advisorUserService: AdvisorUserService,
    private readonly citySharedService: CitySharedService,
    private readonly firebaseService: FirebaseService,
    private readonly notificationService: NotificationSharedService,
  ) {}

  @ApiOperation({ summary: 'Get user profile' })
  @Get()
  async getProfile(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    const user = request.user;
    const result = await this.profileUserService.findOne(user.id);
    return { result };
  }

  @ApiOperation({ summary: 'Get owner profile' })
  @Get('/owner')
  async getOwnerProfile(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    const user = request.user;
    const result = await this.profileUserService.findOwnerProfile(user.id);
    return { result };
  }

  @ApiOperation({ summary: 'Get advisor profile' })
  @Get('/advisor')
  async getAdvisorProfile(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    const user = request.user;
    const result = await this.profileUserService.findAdvisorProfile(user.id);
    return { result };
  }

  @ApiOperation({ summary: 'Register owner' })
  @Put('register/owner')
  async registerOwner(
    @Req() request: RequestType,
    @Body() dto: RegisterOwnerUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = request.user;
    await this.attachmentService.validateFileOwner([dto.selfie_image_id], user.id, 1);
    const { owner, changed } = await this.profileUserService.registerOwner(user.id, dto);
    if (owner.status === OwnerStatus.PENDING)
      await this.profileUserService.validateNationalCodeWebService(owner);

    if (changed)
      this.notificationService
        .createNotification({
          user: { id: null, role: UserRole.ADMIN },
          mustSendNotif: true,
          notification: {
            title: 'مالک جدید',
            body: `${dto.full_name} نقش مالک خود را ثبت کرد`,
          },
          notificationType: NotificationTypes.NEW_OWNER_ACCOUNT,
          notificationableId: owner.id.toString(),
        })
        .catch((e) => this.logger.error(`new owner notification failed: ${e?.message}`));

    return { messageCode: 'CREATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   ADVISOR                                  */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Register advisor' })
  @Put('register/advisor')
  async registerAdvisor(
    @Req() request: RequestType,
    @Body() dto: RegisterAdvisorUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = request.user;
    if (user.advisor_id) await this.profileUserService.checkCanUpdateAdvisor(user, dto.is_special);
    if (dto.is_special) {
      const nationalCodeIsInUse = await this.advisorUserService.findOneByNationalCode(
        user.advisor_id,
        dto.national_code,
      );
      if (nationalCodeIsInUse) throw new ConflictException('REGISTER2');
      const images = [dto.profile_image_id, dto.document_image_id, dto.national_card_image_id];
      await this.attachmentService.validateFileOwner(images, user.id, 1);
      await this.citySharedService.checkCitiesExist(dto.cityIds);
    }
    const advisor = await this.profileUserService.registerAdvisor(user, dto);
    const result = await this.profileUserService.findOne(user.id);
    await this.notificationService.createNotification({
      user: { id: null, role: UserRole.ADMIN },
      mustSendNotif: true,
      notification: {
        title: 'مشاور جدید',
        body: `${result.full_name} نقش مشاور خود را ثبت کرد`,
      },
      notificationType: NotificationTypes.NEW_ADVISOR_ACCOUNT,
      notificationableId: advisor.id.toString(),
    });
    return { result, messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Pay Advisor Subscription' })
  @Post('pay-plan')
  async payAdvisorSubscription(
    @Req() request: RequestType,
    @Body() dto: BuySubscriptionAdvisorDto,
  ): Promise<SuccessResponseArgs> {
    const user = request.user;
    if (!user.advisor_id) throw new UnprocessableEntityException('COMMON4');
    const payUrl = await this.profileUserService.payAdvisorSubscription(user, dto);
    return { result: payUrl };
  }

  @ApiOperation({ summary: 'pay Advisor Subscription' })
  @Delete('pay-plan')
  async revokeAdvisorSubscription(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    const user = request.user;
    if (!user.advisor_id) throw new UnprocessableEntityException('COMMON4');
    const payUrl = await this.profileUserService.revokeAdvisorSubscription(user.advisor_id);
    return { result: payUrl };
  }

  @ApiOperation({ summary: 'Update fcm' })
  @Patch('update-fcm')
  async updateFcm(@Req() request: RequestType, @Body() dto: UpdateFcmDto): Promise<SuccessResponseArgs> {
    const { user } = request;
    const result = await this.profileUserService.updateFcm(user.id, dto);
    const fcmToken = result?.fcm_token;
    const advisorRole = result?.advisor_id;
    const ownerRole = result?.owner_id;

    if (fcmToken) {
      await this.firebaseService.unsubscribeFromTopic(fcmToken, createTopicKey(user.id, UserRole.USER));
      await this.firebaseService.unsubscribeFromTopic(fcmToken, FirebaseTopicType.USER);
      if (ownerRole) await this.firebaseService.unsubscribeFromTopic(fcmToken, FirebaseTopicType.OWNER);
      if (advisorRole) await this.firebaseService.unsubscribeFromTopic(fcmToken, FirebaseTopicType.ADVISOR);
      await this.firebaseService.subscribeToTopic(fcmToken, createTopicKey(user.id, UserRole.USER));
      await this.firebaseService.subscribeToTopic(fcmToken, FirebaseTopicType.USER);
      if (ownerRole) await this.firebaseService.subscribeToTopic(fcmToken, FirebaseTopicType.OWNER);
      if (advisorRole) await this.firebaseService.subscribeToTopic(fcmToken, FirebaseTopicType.ADVISOR);
    }
    return;
  }

  @ApiOperation({ summary: 'Update profile image' })
  @Patch('profile-image')
  async updateProfileImage(
    @Req() request: RequestType,
    @Body() dto: UpdateProfileImageUserDto,
  ): Promise<SuccessResponseArgs> {
    const { user } = request;
    const result = await this.profileUserService.updateProfileImage(user.id, dto);
    return { result, messageCode: 'UPDATE' };
  }
}
