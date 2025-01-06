import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

import { Admin } from '@prisma/client';
import { SignInAdminDto } from 'src/auth/roles/admin/dto/auth-admin.dto';
import { hashPassword } from 'src/auth/common/helpers/admin-password-hash.helper';
import { BannerPositionList } from 'src/banner/common/banner-positions.constant';
import { UserRole } from 'src/common/interfaces/role.enum';
import TokenPayload from 'src/auth/common/interface/token-payload.interface';

@Injectable()
export class AuthAdminService {
  constructor(
    private readonly db: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // private readonly settingService: SettingAdminService,
  }

  /* -------------------------------------------------------------------------- */
  /*                            ADMIN AUTHENTICATION                            */
  /* -------------------------------------------------------------------------- */

  async verifyAdminCredential(dto: SignInAdminDto, isHashed = false): Promise<Admin> {
    const { username, password } = dto;

    const admin = await this.db.admin.findFirst({ where: { username }, include: { role: true } });
    if (!admin) throw new BadRequestException('ADMIN_AUTH1');

    const isMatchedPassword: boolean = isHashed
      ? password == admin.password
      : hashPassword(password) == admin.password;
    if (!isMatchedPassword) throw new BadRequestException('ADMIN_AUTH1');

    delete admin.password;
    return admin;
  }

  async findInitSettings(): Promise<object> {
    const {
      APP_NAME,
      APP_FA_NAME,
      APP_LOGO,
      IS_MARKETPLACE,
      BUSINESS_NAME,
      BUSINESS_ADDRESS,
      BUSINESS_LATITUDE,
      BUSINESS_LONGITUDE,
      HAS_MULTI_PRODUCT_ATTRIBUTE,
      MAIN_ATTRIBUTE_GROUP,
      HAS_OFFER_CODE,
      HAS_PAYMENT,
    } = process.env;

    const contentsCategories = await this.db.contentCategory.findMany();

    return {
      APP_NAME,
      APP_FA_NAME,
      APP_LOGO,
      IS_MARKETPLACE,
      BUSINESS_NAME,
      BUSINESS_ADDRESS,
      BUSINESS_LATITUDE,
      BUSINESS_LONGITUDE,
      HAS_MULTI_PRODUCT_ATTRIBUTE,
      MAIN_ATTRIBUTE_GROUP,
      HAS_OFFER_CODE,
      HAS_PAYMENT,
      BANNER_POSITIONS: BannerPositionList,
      //@ts-ignore
      content_categories: [{ id: 0, title: 'همه' }].concat(contentsCategories),
    };
  }

  /* --------------------------------- HELPERS -------------------------------- */
  generateAdminJwtToken(id: number): { token: string; socket_token: string } {
    const payload: TokenPayload = { id, role: UserRole.ADMIN };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('adminAuth.secret'),
      expiresIn: this.configService.get('adminAuth.expire'),
    });

    const socketToken = this.jwtService.sign(payload, {
      secret: this.configService.get('socket.secret'),
      expiresIn: this.configService.get('socket.expire'),
    });

    return { token, socket_token: socketToken };
  }

  generateAdminSigninToken(id: number): string {
    const payload = { id };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('adminAuth.signinSecret'),
      expiresIn: '5m',
    });

    return token;
  }
}
