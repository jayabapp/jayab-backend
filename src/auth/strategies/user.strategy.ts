import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { PartialUser } from 'src/common/interfaces/user.interface';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(
    private readonly db: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('auth.secret'),
    });
  }

  public async validate(payload: { id: number; jwtLevel: number }): Promise<PartialUser> {
    const user = await this.db.user.findFirst({
      where: { id: payload.id, jwt_level: payload.jwtLevel },
      select: { id: true, mobile_number: true, advisor_id: true, owner_id: true, notification_read_at: true },
    });

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
