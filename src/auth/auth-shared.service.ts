import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOTPDto } from 'src/auth/roles/user/dto/auth-user.dto';
import { random } from 'lodash';

@Injectable()
export class AuthSharedService {
  constructor(
    private readonly db: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Create otp
   * @param dto
   * @returns
   */
  async createOtpCode(
    dto: CreateOTPDto,
    whom: 'admin' | 'user',
    ipAddress?: string,
  ): Promise<{ code: string }> {
    const { mobile_number } = dto;

    /* -------------------------------------------------------------------------- */
    /**
     * find the otp record using the mobile number and the country code.
     * if the OTP verification code has expired, generate it again and send it.
     */
    const otpRecord = await this.db.otp.findFirst({ where: { mobile_number } });
    let finalCode: string = otpRecord?.code;
    let rand = '';

    /* -------------------------------------------------------------------------- */
    if (whom == 'user') {
      const isUserBanned = await this.db.user.findFirst({ where: { mobile_number, is_banned: true } });
      if (isUserBanned) throw new BadRequestException('AUTH10');
      rand = random(1000, 9999).toString();
    } else if (whom == 'admin')
      rand =
        this.configService.get('sms.enableTwoStepVerification') == '1'
          ? random(10000, 99999).toString()
          : '00000';
    else throw new BadRequestException();

    /* -------------------------------------------------------------------------- */
    if (otpRecord) {
      /**
       * if sms sent from thirty seconds ago don't send again
       */
      if (!this.checkTimeDifference(otpRecord.sms_send_at, 0.5)) {
        await this.db.otp.update({
          where: { id: otpRecord.id },
          data: { ip_address: ipAddress, updated_at: otpRecord.updated_at },
        });
        return { code: finalCode };
      }

      /**
       * check the expiration date of the verification code using the checkExpirationCode method.
       */
      const isExpired = this.checkTimeDifference(otpRecord.updated_at);
      if (isExpired) finalCode = rand;
      else finalCode = otpRecord.code;

      await this.db.otp.update({
        where: { id: otpRecord.id },
        data: { code: finalCode, ip_address: ipAddress, sms_send_at: new Date() },
      });
    } else {
      await this.db.otp.create({ data: { mobile_number, code: rand, ip_address: ipAddress } });
      finalCode = rand;
    }

    return { code: finalCode };
  }

  /**
   * validate otp
   * @param mobileNumber
   * @param code
   * @returns
   */
  async validateOTP(mobileNumber: string, code: string): Promise<void> {
    if (!code || !mobileNumber) throw new BadRequestException('AUTH1');

    const otpRecord = await this.db.otp.findUnique({
      where: { mobile_number: mobileNumber },
    });
    if (!otpRecord) throw new ForbiddenException('AUTH1');

    const isExpired = this.checkTimeDifference(otpRecord.updated_at);
    if (isExpired) throw new BadRequestException('AUTH2');

    if (otpRecord.code != code) {
      if (otpRecord.attempts + 1 >= this.configService.get('project.maxOtpAttempts')) {
        await this.db.otp.delete({ where: { id: otpRecord.id } });
      } else await this.db.otp.update({ where: { id: otpRecord.id }, data: { attempts: { increment: 1 } } });
      throw new BadRequestException('AUTH1_1');
    }

    // Delete otp row
    await this.db.otp.delete({ where: { id: otpRecord.id } });
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPERS                                  */
  /* -------------------------------------------------------------------------- */

  checkTimeDifference(time: Date, maxDiffInMinutes = 3): boolean {
    if (!time) return false;
    const diff = new Date().getTime() - time.getTime();

    const isExpired = diff > maxDiffInMinutes * 60 * 1000;

    return isExpired;
  }
}
