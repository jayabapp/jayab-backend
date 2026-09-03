import { Injectable, UnauthorizedException } from '@nestjs/common';
import { getUserInfoCacheManagerKey } from 'src/common/helpers/cache-manager-key.constant';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { MAX_ACTIVE_DEVICES } from 'src/common/utils/constants/constants';
import { TestAccessService } from 'src/test-access/test-access.service';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { PartialUser } from 'src/common/interfaces/user.interface';

import Redis from 'ioredis';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(
    private readonly db: PrismaService,
    private configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
    private readonly testAccessService: TestAccessService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('auth.secret'),
    });
  }

  public async validate(payload: { id: number; jwtLevel: number }): Promise<PartialUser> {
    if (this.testAccessService.isEnabled()) {
      const accessUser = await this.db.user.findUnique({
        where: { id: payload.id },
        select: { mobile_number: true },
      });
      if (!accessUser) throw new UnauthorizedException();
      if (!(await this.testAccessService.isAllowed(accessUser.mobile_number)))
        throw new UnauthorizedException('TEST_ACCESS_DENIED');
    }

    const CACHE_KEY = getUserInfoCacheManagerKey(payload.id);
    const cacheData: string = await this.redis.get(CACHE_KEY);

    if (cacheData) {
      const decodedCacheData = Buffer.from(cacheData, 'base64').toString('utf-8');
      const userDataFromCache: PartialUser = JSON.parse(decodedCacheData);
      this.isUserAuthenticated(userDataFromCache.jwt_level, payload?.jwtLevel);
      return userDataFromCache;
    }

    const user = await this.db.user.findFirst({
      where: { id: payload.id, jwt_level: { lt: payload.jwtLevel + MAX_ACTIVE_DEVICES } },
      select: {
        id: true,
        mobile_number: true,
        advisor_id: true,
        owner_id: true,
        notification_read_at: true,
        created_at: true,
        contact_click_limit_exceeded_at: true,
        jwt_level: true,
      },
    });

    this.isUserAuthenticated(user.jwt_level, payload?.jwtLevel);

    const base64String = Buffer.from(JSON.stringify(user)).toString('base64');
    await this.redis.set(CACHE_KEY, base64String, 'EX', 60);
    return user;
  }

  isUserAuthenticated(userJwtLevel: number, payloadJwtLevel: number): void {
    if (userJwtLevel > payloadJwtLevel + MAX_ACTIVE_DEVICES) {
      throw new UnauthorizedException();
    }
  }
}
