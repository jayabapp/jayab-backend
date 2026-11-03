import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UserRole } from 'src/common/interfaces/role.enum';
import TokenPayload from '../interface/token-payload.interface';

const logger = new Logger('AdminImpersonation');

type ImpersonationTarget = { id: number; jwt_level?: number | null };

/**
 * Shared by the user (`user/:id/sso`) and property-owner (`property/:id/sso`)
 * admin SSO endpoints. Embeds `purpose=admin_impersonation` plus the acting
 * admin's id so `UserJwtStrategy` can bypass the test-access allowlist for
 * this token only — every other check (ban, jwt level, property access,
 * RBAC on the panel side) still applies normally. Logs the start of the
 * session for audit purposes; there is no dedicated audit table yet, so this
 * relies on the platform's log aggregation to keep it queryable.
 */
export function issueImpersonationToken(
  jwtService: JwtService,
  configService: ConfigService,
  target: ImpersonationTarget,
  actorAdminId: number,
  ip?: string,
): string {
  const jti = randomUUID();
  const payload: TokenPayload = {
    id: target.id,
    jwtLevel: target.jwt_level || 1,
    role: UserRole.USER,
    purpose: 'admin_impersonation',
    actor_admin_id: actorAdminId,
    target_user_id: target.id,
    jti,
  };
  const token = jwtService.sign(payload, {
    secret: configService.get('auth.secret'),
    expiresIn: '30m',
  });
  logger.log(
    `impersonation_start jti=${jti} actor_admin_id=${actorAdminId} target_user_id=${target.id} ip=${ip ?? 'unknown'}`,
  );
  return token;
}
