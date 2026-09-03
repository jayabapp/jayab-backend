import { Body, Controller, Get, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CreateOTPDto, VerifyOTPDto } from 'src/auth/roles/user/dto/auth-user.dto';
import { USER_AUTH_ROUTE_GROUP } from 'src/auth/common/route-group.constant';
import { BookmarkUserService } from 'src/bookmark/roles/user/bookmark.service';
import { FavoriteUserService } from 'src/favorite/roles/user/user.service';
import { SettingAdminService } from 'src/setting/roles/admin/admin.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AuthThrottlerGuard } from 'src/auth/guards/auth-throttler.guard';
import { ProfileUserService } from 'src/profile/roles/user/profile-user.service';
import { AuthSharedService } from 'src/auth/auth-shared.service';
import { TestAccessService } from 'src/test-access/test-access.service';
import { AuthUserService } from './auth-user.service';
import { ConfigService } from '@nestjs/config';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { RequestType } from 'src/common/interfaces/user.interface';
import { SmsService } from 'src/sms/sms.service';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';

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
    private readonly profileUserService: ProfileUserService,
    private readonly testAccessService: TestAccessService,
  ) {}

  @ApiOperation({ summary: 'Create OTP code' })
  @UseGuards(AuthThrottlerGuard)
  @Post('/otp')
  async createOtpCode(@Req() req: Request, @Body() dto: CreateOTPDto): Promise<SuccessResponseArgs> {
    await this.testAccessService.assertAllowed(dto.mobile_number);
    const otpRecord = await this.authSharedService.createOtpCode(dto, 'user', req.ip);
    let code = otpRecord?.code;

    const resultMessage = code ? 'AUTH1' : 'AUTH1_1';

    if (!this.testAccessService.isEnabled() && this.config.get('NODE_ENV') === 'production' && code) {
      await this.smsService.sendVerificationCode(dto.mobile_number, code);
      code = null;
    }
    return { result: code, messageCode: resultMessage };
  }

  @ApiOperation({ summary: 'Verify OTP code' })
  @UseGuards(AuthThrottlerGuard)
  @Post('/otp/verify')
  async verifyOtpCode(@Req() req: Request, @Body() dto: VerifyOTPDto): Promise<SuccessResponseArgs> {
    await this.testAccessService.assertAllowed(dto.mobile_number);
    await this.authSharedService.validateOTP(dto.mobile_number, dto.code);

    const { user, isNewUser } = await this.authUserService.findOrCreateUser(dto.mobile_number);
    const tokens = await this.authUserService.generateJwtToken(user.id, user.jwt_level);
    await this.authUserService.createAuthLog(user.id, isNewUser, req, dto.query_params);

    return {
      result: { access_token: tokens.token, socket_token: tokens.socket_token },
    };
  }

  @Throttle({ default: { limit: 30, ttl: 30000 } })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(5000)
  @ApiOperation({ summary: 'Get Init Settings' })
  @Get('init-settings')
  async findInitSettings(): Promise<SuccessResponseArgs> {
    const init = await this.authUserService.findInitSettings();
    return { result: init };
  }

  @ApiOperation({ summary: 'Get Init User' })
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth('user-jwt')
  @Get('init-user')
  async findInitUser(@Req() req: RequestType): Promise<SuccessResponseArgs> {
    const user = req.user;
    const bookmarks = await this.bookmarkUserService.findAllIds(user.id);
    const favorites = await this.favoriteUserService.findAllIds(user.id);
    const isValidAdvisor = await this.profileUserService.checkUserIsActiveAdvisor('', user.id);
    return { result: { bookmarks, favorites, isValidAdvisor } };
  }
}
