import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserAuthJwtStrategy extends PassportStrategy(Strategy, 'user-auth-jwt') {
  constructor(
    private readonly db: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('userAuth.secret'),
    });
  }

  public async validate(payload: { id: number }): Promise<User> {
    const user = await this.db.user.findUnique({ where: { id: payload.id } });
    if (!user) throw new UnauthorizedException();

    return user;
  }
}
