import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { random } from 'lodash';
import TokenPayload from 'src/auth/common/interface/token-payload.interface';
import { UserRole } from 'src/common/interfaces/role.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { SettingKey } from 'src/setting/common/interfaces/settings.interface';
import { SettingAdminService } from 'src/setting/roles/admin/admin.service';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class AuthUserService {
  constructor(
    private readonly db: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly settingService: SettingAdminService,
  ) {}

  /**
   * find or create new user
   * @param mobileNumber
   * @returns
   */
  async findOrCreateUser(mobileNumber: string): Promise<{ user: User; isNewUser: boolean }> {
    /* -------------------------------------------------------------------------- */
    let user = await this.db.user.findUnique({
      where: { mobile_number: mobileNumber },
    });

    let isNewUser = false;
    /* -------------------------------------------------------------------------- */
    /**
     * create a new user if not found
     */
    if (!user) {
      let referralCode: string;
      do {
        referralCode = `${random(100_000, 999_999)}`;
      } while (await this.db.user.findUnique({ where: { referral_code: referralCode } }));

      user = await this.db.user.create({
        data: { mobile_number: mobileNumber, referral_code: referralCode },
      });
      isNewUser = true;
    }

    return { user, isNewUser };
  }

  async findUserByMobileNumber(mobileNumber: string): Promise<User> {
    let user = await this.db.user.findFirst({
      where: { mobile_number: mobileNumber },
    });

    return user;
  }

  /**
   * @param user
   * @returns
   */
  isRegistered(user: User): boolean {
    return !!user.full_name;
  }

  async createAuthLog(userId: number, isNewUser: boolean, req: Request, queryParams: any): Promise<void> {
    const ua = req.get('User-Agent');
    //@ts-ignore
    const uaParsed = UAParser(ua);

    await this.db.authLog.create({
      data: {
        user_id: userId,
        ua: ua,
        ua_parsed: uaParsed,
        ip_address: req.ip,
        utm_source: queryParams?.utm_source || null,
        utm_medium: queryParams?.utm_medium || null,
        utm_campaign: queryParams?.utm_campaign || null,
        utm_content: queryParams?.utm_content || null,
        utm_term: queryParams?.utm_term || null,
        redirect_url: queryParams?.redirect_url || null,
        is_new_user: isNewUser,
      },
    });
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

  /**
   * Generate jwt token
   * in every generate jwt level must be increased to expire old tokens
   * @param id
   * @param jwtLevel
   * @returns
   */
  async generateJwtToken(id: number, jwtLevel: number): Promise<{ token: string; socket_token: string }> {
    const payload: TokenPayload = { id, jwtLevel: (jwtLevel || 1) + 1, role: UserRole.USER };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('auth.secret'),
      expiresIn: this.configService.get('auth.expire'),
    });

    const socketToken = this.jwtService.sign(payload, {
      secret: this.configService.get('socket.secret'),
      expiresIn: this.configService.get('socket.expire'),
    });

    await this.db.user.update({ where: { id }, data: { jwt_level: { increment: 1 } } });

    return { token, socket_token: socketToken };
  }

  /* -------------------------------------------------------------------------- */
  /*                              GENERATE TOKEN                                */
  /* -------------------------------------------------------------------------- */
  generateAuthJwtToken(id: number): string {
    const payload: { id: number } = { id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('userAuth.secret'),
      expiresIn: this.configService.get('userAuth.expire'),
    });

    return token;
  }

  /* -------------------------------------------------------------------------- */
  /*                                 GUEST USER                                 */
  /* -------------------------------------------------------------------------- */
  generateGuestJwtToken(uuid: string, fingerprint: string): string {
    const payload: { uuid: string; fingerprint: string } = { uuid, fingerprint };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('auth.guestSecret'),
      expiresIn: this.configService.get('auth.guestExpire'),
    });

    return token;
  }

  async verifyGuestJwtToken(token: string): Promise<{ uuid: string; fingerprint: string }> {
    const withoutBearer = token?.includes('Bearer') ? token?.split(' ')?.[1] : token;
    let decoded;
    try {
      decoded = await this.jwtService.verify(withoutBearer, {
        secret: this.configService.get('auth.guestSecret'),
      });
    } catch (error) {
      throw new UnauthorizedException();
    }

    return decoded;
  }

  async createGuestToken(fingerprint: string): Promise<string> {
    const uniqueId = uuidv4();
    const tempToken = this.generateGuestJwtToken(uniqueId, fingerprint);
    return tempToken;
  }

  /* -------------------------------------------------------------------------- */
  /*                               END GUEST USER                               */
  /* -------------------------------------------------------------------------- */

  async findInitSettings(): Promise<object> {
    const googleTagManagerId = await this.settingService.get(SettingKey.GOOGLE_TAG_MANAGER_KEY);

    return { googleTagManagerId };
  }
}
