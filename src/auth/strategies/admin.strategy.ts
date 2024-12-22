import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { Admin } from '@prisma/client';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private readonly db: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('adminAuth.secret'),
    });
  }

  public async validate(payload: { id: number }): Promise<Admin> {
    const admin = await this.db.admin.findFirst({ where: { id: payload.id }, include: { role: true } });
    if (!admin || !admin.is_active) throw new UnauthorizedException();

    delete admin.password;
    return admin;
  }
}
