import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import TokenPayload from 'src/auth/common/interface/token-payload.interface';
import { v4 as uuidv4 } from 'uuid';
import { __baseDir } from 'src/config/settings';
import { getB2cConfig } from 'src/config/b2c.config';
import { SettingKey } from 'src/setting/common/interfaces/settings.interface';
import { UserRole } from 'src/common/interfaces/role.enum';
import { random } from 'lodash';

@Injectable()
export class AuthUserService {
  constructor(
    private readonly db: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * find or create new user
   * @param mobileNumber
   * @returns
   */
  async findOrCreateUser(mobileNumber: string): Promise<User> {
    /* -------------------------------------------------------------------------- */
    let user = await this.db.user.findFirst({
      where: { mobile_number: mobileNumber },
    });

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
    }

    return user;
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
    const hasProductAttribute = getB2cConfig('HAS_MULTI_PRODUCT_ATTRIBUTE') == '1';
    const isMarketplace = getB2cConfig('IS_MARKETPLACE') == '1';
    const hasPayment = getB2cConfig('HAS_PAYMENT') == '1';
    const settings = await this.db.setting.findMany();
    const googleTagManagerId = settings.find((e) => e.key == SettingKey.GOOGLE_TAG_MANAGER_KEY)?.value;

    return { isMarketplace, hasProductAttribute, googleTagManagerId, hasPayment };
  }
}
