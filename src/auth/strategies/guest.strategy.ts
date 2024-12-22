import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { createGuestBrowserFingerprint } from 'src/common/helpers/guest-fingerprint.helper';

@Injectable()
export class GuestJwtStrategy extends PassportStrategy(Strategy, 'guest-jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('auth.guestSecret'),
      passReqToCallback: true,
    });
  }

  public async validate(req: Request, payload: { uuid: string; fingerprint: string }): Promise<any> {
    // const browserFingerprint = createGuestBrowserFingerprint(req.headers['user-agent']);
    // if (browserFingerprint != payload.fingerprint) return false;
    if (!payload.uuid) return false;

    return { uuid: payload.uuid };
  }
}
