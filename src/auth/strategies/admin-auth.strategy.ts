import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { Admin } from '@prisma/client';

@Injectable()
export class AdminAuthJwtStrategy extends PassportStrategy(Strategy, 'admin-auth-jwt') {
  constructor(private readonly db: PrismaService, private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('adminAuth.signinSecret'),
    });
  }

  public async validate(payload: { id: number }): Promise<Admin> {
    const admin = await this.db.admin.findFirst({ where: { id: payload.id } });
    if (!admin) throw new UnauthorizedException();

    return admin;
  }
}
