import {
  Controller,
  Get,
  Body,
  UseGuards,
  Req,
  Patch,
  Put,
  BadRequestException,
  ConflictException,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PartialUser, RequestType } from 'src/common/interfaces/user.interface';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AttachmentService } from 'src/attachment/attachment.service';
import { UpdateFcmDto, UpdateProfileDto } from 'src/profile/dto/update-profile.dto';
import { ProfileUserService } from './profile-user.service';
import { PROFILE_USER_ROUTE_GROUP } from 'src/profile/common/route-group.constant';
import { BuySubscriptionAdvisorDto, RegisterAdvisorUserDto, RegisterOwnerUserDto } from './dto/register.dto';
import { OwnerUserService } from 'src/owner/roles/user/user.service';
import { AdvisorUserService } from 'src/advisor/roles/user/user.service';
import { CitySharedService } from 'src/city/shared.service';

@ApiTags('Profiles - USER')
@ApiBearerAuth('user-jwt')
@UseGuards(UserJwtGuard)
@Controller(PROFILE_USER_ROUTE_GROUP)
export class ProfileUserController {
  constructor(
    private readonly profileUserService: ProfileUserService,
    private readonly attachmentService: AttachmentService,
    private readonly ownerUserService: OwnerUserService,
    private readonly advisorUserService: AdvisorUserService,
    private readonly citySharedService: CitySharedService,
  ) {}

  @ApiOperation({ operationId: 'Get user profile' })
  @Get()
  async getProfile(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    const user = request.user;
    const result = await this.profileUserService.findOne(user.id);

    return { result };
  }

  @ApiOperation({ operationId: 'Get owner profile' })
  @Get('/owner')
  async getOwnerProfile(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    const user = request.user;
    const result = await this.profileUserService.findOwnerProfile(user.id);
    return { result };
  }

  @ApiOperation({ operationId: 'Get advisor profile' })
  @Get('/advisor')
  async getAdvisorProfile(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    const user = request.user;
    const result = await this.profileUserService.findAdvisorProfile(user.id);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                  REGISTER                                  */
  /* -------------------------------------------------------------------------- */
  // @ApiOperation({ operationId: 'Update profile' })
  // @Put()
  // async updateProfile(
  //   @Req() request: RequestType,
  //   @Body() dto: UpdateProfileDto,
  // ): Promise<SuccessResponseArgs> {
  //   const user = request.user;
  //   if (dto.profile_image_id)
  //     await this.attachmentService.validateFileOwner([dto.profile_image_id], user.id, 1);
  //   await this.profileUserService.updateProfile(user.id, dto);
  //   return { messageCode: 'UPDATE' };
  // }

  /**
   * ابتدا مالکو ایجاد میکنیم و سپس صحت آن را بررسی میکنیم
   */
  @ApiOperation({ operationId: 'Register owner' })
  @Put('register/owner')
  async registerOwner(
    @Req() request: RequestType,
    @Body() dto: RegisterOwnerUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = request.user;

    /* -------------------------------------------------------------------------- */
    // check duplicate request
    if (user.owner_id) throw new BadRequestException('REGISTER1');

    /* -------------------------------------------------------------------------- */
    // check the national code repetition
    const nationalCodeIsInUse = await this.ownerUserService.findOneByNationalCode(dto.national_code);
    if (nationalCodeIsInUse) throw new ConflictException('REGISTER2');

    /* -------------------------------------------------------------------------- */
    // check selfie image
    await this.attachmentService.validateFileOwner([dto.selfie_image_id], user.id, 1);

    /* -------------------------------------------------------------------------- */
    // create
    const owner = await this.profileUserService.registerOwner(user.id, dto);

    /* -------------------------------------------------------------------------- */
    // TODO: validate the national code
    await this.profileUserService.validateNationalCodeWebService(owner);

    return { messageCode: 'CREATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   ADVISOR                                  */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Register advisor' })
  @Put('register/advisor')
  async registerAdvisor(
    @Req() request: RequestType,
    @Body() dto: RegisterAdvisorUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = request.user;

    /* -------------------------------------------------------------------------- */
    // check duplicate request
    if (user.advisor_id) throw new BadRequestException('REGISTER1');

    /* -------------------------------------------------------------------------- */
    // check the national code repetition, images and cities
    if (dto.is_special) {
      const nationalCodeIsInUse = await this.advisorUserService.findOneByNationalCode(dto.national_code);
      if (nationalCodeIsInUse) throw new ConflictException('REGISTER2');

      const images = [dto.profile_image_id, dto.document_image_id, dto.national_card_image_id];
      await this.attachmentService.validateFileOwner(images, user.id, 1);

      await this.citySharedService.checkCitiesExist(dto.cityIds);
    }

    /* -------------------------------------------------------------------------- */
    await this.profileUserService.registerAdvisor(user.id, dto);

    return { messageCode: 'CREATE' };
  }

  @ApiOperation({ operationId: 'pay Advisor Subscription' })
  @Post('pay-plan')
  async payAdvisorSubscription(
    @Req() request: RequestType,
    @Body() dto: BuySubscriptionAdvisorDto,
  ): Promise<SuccessResponseArgs> {
    /*  */
    const user = request.user as PartialUser;
    if (!user.advisor_id) throw new UnprocessableEntityException('COMMON4');

    /*  */
    const payUrl = await this.profileUserService.payAdvisorSubscription(user, dto);

    return { result: payUrl };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Update fcm' })
  @Patch('update-fcm')
  async updateFcm(@Req() request: RequestType, @Body() dto: UpdateFcmDto): Promise<SuccessResponseArgs> {
    const { user } = request;
    await this.profileUserService.updateFcm(user, dto);
    return;
  }
}
