import { UserRole } from 'src/common/interfaces/role.enum';

export default interface TokenPayload {
  id: number;
  jwtLevel?: number;
  role?: UserRole;
  /** Set only on admin-impersonation SSO tokens — never accepted from client input. */
  purpose?: 'admin_impersonation';
  actor_admin_id?: number;
  target_user_id?: number;
  jti?: string;
}
