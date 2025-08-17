import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AuthAdminService } from './auth-admin.service';
import { SignInAdminDto, VerifyAdminOTPDto } from 'src/auth/roles/admin/dto/auth-admin.dto';
import { AuthSharedService } from 'src/auth/auth-shared.service';
import { ADMIN_AUTH_ROUTE_GROUP } from 'src/auth/common/route-group.constant';
import { SmsService } from 'src/sms/sms.service';
import { AdminAuthJwtGuard } from 'src/auth/guards/jwt/admin-auth.guard';
import { Admin } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';

@ApiTags('🔐 Auth - ADMIN')
@Controller(ADMIN_AUTH_ROUTE_GROUP)
export class AuthAdminController {
  constructor(
    private readonly authAdminService: AuthAdminService,
    private readonly smsService: SmsService,
    private authSharedService: AuthSharedService,
    private configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Signin admin' })
  @Post('signin')
  async createOtpCode(@Body() dto: SignInAdminDto): Promise<SuccessResponseArgs> {
    const adminData = await this.authAdminService.verifyAdminCredential(dto);
    const result = await this.authSharedService.createOtpCode(
      {
        mobile_number: adminData.mobile_number,
      },
      'admin',
    );

    /**
     * this token will use in otp route
     */
    const signinToken = this.authAdminService.generateAdminSigninToken(adminData.id);

    // send sms
    if (
      process.env.NODE_ENV == 'production' &&
      this.configService.get('adminAuth.enableTwoStepVerification') == '1'
    )
      await this.smsService.sendVerificationCode(adminData.mobile_number, result.code);

    return { result: { code: null, signin_token: signinToken }, messageCode: 'AUTH1' }; //TODO: remove code
  }

  @ApiOperation({ summary: 'Check otp code' })
  @ApiBearerAuth('admin-auth-jwt')
  @UseGuards(AdminAuthJwtGuard)
  @Post('two-step-verification')
  async verifyOtpCode(@Req() request, @Body() dto: VerifyAdminOTPDto): Promise<SuccessResponseArgs> {
    const admin = request.user as Admin;
    const { username, password } = admin;

    const adminData = await this.authAdminService.verifyAdminCredential({ username, password }, true);
    await this.authSharedService.validateOTP(adminData.mobile_number, dto.code);

    const tokens = this.authAdminService.generateAdminJwtToken(adminData.id);

    return { result: { admin: adminData, tokens }, messageCode: 'AUTH3' };
  }

  @ApiOperation({ summary: 'Get Init Settings' })
  @ApiBearerAuth('admin-jwt')
  @UseGuards(AdminJwtGuard)
  @Get('init-settings')
  async findInitSettings(): Promise<SuccessResponseArgs> {
    const init = await this.authAdminService.findInitSettings();
    return { result: init };
  }

  @ApiOperation({ summary: 'Validate site edit mode' })
  @ApiBearerAuth('admin-jwt')
  @UseGuards(AdminJwtGuard)
  @Get('validate-edit-mode')
  async validateEditMode(): Promise<SuccessResponseArgs> {
    return { result: { can_edit: true } };
  }
}
