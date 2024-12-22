import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SmsService } from 'src/sms/sms.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { USER_AUTH_ROUTE_GROUP } from 'src/auth/common/route-group.constant';
import { AuthUserService } from './auth-user.service';
import { CreateOTPDto, VerifyOTPDto } from 'src/auth/roles/user/dto/auth-user.dto';
import { AuthSharedService } from 'src/auth/auth-shared.service';
import { RequestType } from 'src/common/interfaces/user.interface';
import { RegisterProfileDto } from './dto/register-profile.dto';
import { UserAuthJwtGuard } from 'src/auth/guards/jwt/user-auth-jwt.guard';
import { User } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { createGuestBrowserFingerprint } from 'src/common/helpers/guest-fingerprint.helper';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { UserRole } from 'src/common/interfaces/role.enum';
import { NotificationTypes } from 'src/firebase/constants/notif-types';
import { SettingAdminService } from 'src/setting/roles/admin/admin.service';
import { SettingKey } from 'src/setting/common/interfaces/settings.interface';

@ApiTags('🔐 Auth - USER')
@Controller(USER_AUTH_ROUTE_GROUP)
export class AuthUserController {
  constructor(
    private readonly authUserService: AuthUserService,
    private readonly setting: SettingAdminService,
    private readonly smsService: SmsService,
    private readonly authSharedService: AuthSharedService,
  ) {}

  @Throttle({ default: { limit: 3, ttl: 30000 } })
  @ApiOperation({ operationId: 'Create OTP code' })
  @Post('/otp')
  async createOtpCode(@Body() dto: CreateOTPDto): Promise<SuccessResponseArgs> {
    const blockUnregistered = await this.setting.get(SettingKey.BLOCK_UNREGISTERED_USER);

    if (blockUnregistered === '1') {
      const user = await this.authUserService.findUserByMobileNumber(dto.mobile_number);
      if (!user) throw new BadRequestException('AUTH9');
    }
    /**
     * create otp
     */
    const result = await this.authSharedService.createOtpCode(dto, 'user');
    const code = result?.code;

    // send sms
    if (process.env.NODE_ENV == 'production')
      await this.smsService.sendVerificationCode(dto.mobile_number, code);

    return { result: null, messageCode: code ? 'AUTH1' : 'AUTH1_1' };
  }

  @ApiOperation({ operationId: 'Verify OTP code' })
  @ApiHeader({ name: 'authorization', required: false })
  @Post('/otp/verify')
  async verifyOtpCode(@Req() req: Request, @Body() dto: VerifyOTPDto): Promise<SuccessResponseArgs> {
    /**
     * validate OTP
     */
    await this.authSharedService.validateOTP(dto.mobile_number, dto.code); //TODO

    let token: string;

    const user = await this.authUserService.findOrCreateUser(dto.mobile_number);

    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const { authorization } = req.headers;
    if (authorization) {
      const decoded = await this.authUserService.verifyGuestJwtToken(authorization);
      if (decoded?.uuid) {
        // await this.orderUserService.mergeCartsAfterLogin(decoded.uuid, user.id);
      }
    }
    /**
     * اگر کاربر رجیستر نبود توکن موقت میسازیم و میره برای وارد کردن اطلاعات پروفایل
     */
    if (!this.authUserService.isRegistered(user)) {
      token = this.authUserService.generateAuthJwtToken(user.id);
      return { result: { auth_token: token } };
    }

    /**
     * برای کاربر رجیستر شده توکن اصلی میسازیم
     */
    token = await this.authUserService.generateJwtToken(user.id, user.jwt_level);

    return { result: { access_token: token, user }, messageCode: 'AUTH3' };
  }

  /**
   * @description This api can only be used after registration.
   */
  @ApiOperation({ operationId: 'Update profile after register' })
  @ApiBearerAuth('user-auth-jwt')
  @UseGuards(UserAuthJwtGuard)
  @Put('profile')
  async updateProfile(
    @Req() request: RequestType,
    @Body() registerProfileDto: RegisterProfileDto,
  ): Promise<SuccessResponseArgs> {
    let user: User = request.user;

    /**
     * Check user registration
     */
    const isRegistered = this.authUserService.isRegistered(user);
    if (isRegistered) throw new BadRequestException('AUTH6');

    /**
     * Update profile
     */
    // user = await this.profileUserService.updateProfile(user.id, registerProfileDto);

    /**
     * Generate user jwt token
     */
    const token = await this.authUserService.generateJwtToken(user.id, user.jwt_level);

    /* -------------------------------------------------------------------------- */
    /* SEND NOTIFICATION */
    // await this.notificationSharedService.createNotification({
    //   user: { id: null, role: UserRole.ADMIN },
    //   mustSendNotif: true,
    //   notification: {
    //     title: 'ثبت نام جدید',
    //     body: `کاربر جدیدی ثبت نام کرده است`,
    //   },
    //   notificationType: NotificationTypes.NEW_USER_ACCOUNT,
    //   notificationableId: user?.id?.toString(),
    // });

    return { result: { user, access_token: token } };
  }

  @Throttle({ default: { limit: 3, ttl: 30000 } })
  @ApiOperation({ operationId: 'Get Guest Token' })
  @Post('guest-token')
  async createGuestToken(@Req() request: Request): Promise<SuccessResponseArgs> {
    const fingerprint = createGuestBrowserFingerprint(request.headers['user-agent']);

    const guestToken = await this.authUserService.createGuestToken(fingerprint);
    return { result: { access_token: guestToken } };
  }

  @Throttle({ default: { limit: 10, ttl: 30000 } })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(5000)
  @ApiOperation({ operationId: 'Get Init Settings' })
  @Get('init-settings')
  async findInitSettings(): Promise<SuccessResponseArgs> {
    const init = await this.authUserService.findInitSettings();
    return { result: init };
  }

  // @ApiOperation({ operationId: 'Get private key' })
  // @Post('test')
  // async findPublicKey(
  //   @Req() request: RequestType,
  //   @Body() registerProfileDto: RegisterProfileDto,
  // ): Promise<SuccessResponseArgs> {
  //   const orderCode = `${moment().subtract(6, 'month').subtract(15, 'day').format('jYYYYjMMjDD')}${
  //     1 + 100_000
  //   }`;
  //   console.log({ orderCode });

  //   return;
  // }
}
