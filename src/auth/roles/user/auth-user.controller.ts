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
import { SettingAdminService } from 'src/setting/roles/admin/admin.service';
import { ConfigService } from '@nestjs/config';
import { BookmarkUserService } from 'src/bookmark/roles/user/bookmark.service';
import { FavoriteUserService } from 'src/favorite/roles/user/user.service';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';

@ApiTags('🔐 Auth - USER')
@Controller(USER_AUTH_ROUTE_GROUP)
export class AuthUserController {
  constructor(
    private readonly authUserService: AuthUserService,
    private readonly setting: SettingAdminService,
    private readonly smsService: SmsService,
    private readonly authSharedService: AuthSharedService,
    private readonly config: ConfigService,
    private readonly bookmarkUserService: BookmarkUserService,
    private readonly favoriteUserService: FavoriteUserService,
  ) {}

  @Throttle({ default: { limit: 3, ttl: 30000 } })
  @ApiOperation({ operationId: 'Create OTP code' })
  @Post('/otp')
  async createOtpCode(@Body() dto: CreateOTPDto): Promise<SuccessResponseArgs> {
    /* -------------------------------------------------------------------------- */
    /**
     * create otp
     */
    const otpRecord = await this.authSharedService.createOtpCode(dto, 'user');
    let code = otpRecord?.code;

    /* -------------------------------------------------------------------------- */
    /**
     * send sms
     */
    const resultMessage = code ? 'AUTH1' : 'AUTH1_1';

    if (this.config.get('NODE_ENV') == 'production' && code) {
      await this.smsService.sendVerificationCode(dto.mobile_number, code);
      code = null;
    }

    return { result: code, messageCode: resultMessage };
  }

  @ApiOperation({ operationId: 'Verify OTP code' })
  // @ApiHeader({ name: 'authorization', required: false })
  @Post('/otp/verify')
  async verifyOtpCode(@Req() req: Request, @Body() dto: VerifyOTPDto): Promise<SuccessResponseArgs> {
    /* -------------------------------------------------------------------------- */
    /**
     * validate OTP
     */
    await this.authSharedService.validateOTP(dto.mobile_number, dto.code);

    /* -------------------------------------------------------------------------- */
    const user = await this.authUserService.findOrCreateUser(dto.mobile_number);

    /* -------------------------------------------------------------------------- */
    // let token: string;

    // /**
    //  * اگر کاربر رجیستر نبود توکن موقت میسازیم و میره برای وارد کردن اطلاعات پروفایل
    //  */
    // if (!this.authUserService.isRegistered(user)) {
    //   token = this.authUserService.generateAuthJwtToken(user.id);
    //   return { result: { auth_token: token } };
    // }

    /* -------------------------------------------------------------------------- */
    /**
     * برای کاربر رجیستر شده توکن اصلی میسازیم
     */
    const tokens = await this.authUserService.generateJwtToken(user.id, user.jwt_level);

    return {
      result: { access_token: tokens.token, socket_token: tokens.socket_token },
      messageCode: 'AUTH3',
    };
  }

  // /**
  //  * @description This api can only be used after registration.
  //  */
  // @ApiOperation({ operationId: 'Update profile after register' })
  // @ApiBearerAuth('user-auth-jwt')
  // @UseGuards(UserAuthJwtGuard)
  // @Put('profile')
  // async updateProfile(
  //   @Req() request: RequestType,
  //   @Body() registerProfileDto: RegisterProfileDto,
  // ): Promise<SuccessResponseArgs> {
  //   let user: User = request.user;

  //   /**
  //    * Check user registration
  //    */
  //   const isRegistered = this.authUserService.isRegistered(user);
  //   if (isRegistered) throw new BadRequestException('AUTH6');

  //   /**
  //    * Update profile
  //    */
  //   // user = await this.profileUserService.updateProfile(user.id, registerProfileDto);

  //   /**
  //    * Generate user jwt token
  //    */
  //   const token = await this.authUserService.generateJwtToken(user.id, user.jwt_level);

  //   /* -------------------------------------------------------------------------- */
  //   /* SEND NOTIFICATION */
  //   // await this.notificationSharedService.createNotification({
  //   //   user: { id: null, role: UserRole.ADMIN },
  //   //   mustSendNotif: true,
  //   //   notification: {
  //   //     title: 'ثبت نام جدید',
  //   //     body: `کاربر جدیدی ثبت نام کرده است`,
  //   //   },
  //   //   notificationType: NotificationTypes.NEW_USER_ACCOUNT,
  //   //   notificationableId: user?.id?.toString(),
  //   // });

  //   return { result: { user, access_token: token } };
  // }

  // @Throttle({ default: { limit: 3, ttl: 30000 } })
  // @ApiOperation({ operationId: 'Get Guest Token' })
  // @Post('guest-token')
  // async createGuestToken(@Req() request: Request): Promise<SuccessResponseArgs> {
  //   const fingerprint = createGuestBrowserFingerprint(request.headers['user-agent']);

  //   const guestToken = await this.authUserService.createGuestToken(fingerprint);
  //   return { result: { access_token: guestToken } };
  // }

  // @Throttle({ default: { limit: 10, ttl: 30000 } })
  // @UseInterceptors(CacheInterceptor)
  // @CacheTTL(5000)
  // @ApiOperation({ operationId: 'Get Init Settings' })
  // @Get('init-settings')
  // async findInitSettings(): Promise<SuccessResponseArgs> {
  //   const init = await this.authUserService.findInitSettings();
  //   return { result: init };
  // }

  @ApiOperation({ operationId: 'Get Init Profile' })
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth('user-jwt')
  @Get('init-settings')
  async findInitSettings(@Req() req: RequestType): Promise<SuccessResponseArgs> {
    const user = req.user;
    const bookmarks = await this.bookmarkUserService.findAllIds(user.id);
    const favorites = await this.favoriteUserService.findAllIds(user.id);
    return { result: { bookmarks, favorites } };
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
