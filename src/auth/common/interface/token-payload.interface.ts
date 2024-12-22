import { UserRole } from 'src/common/interfaces/role.enum';

export default interface TokenPayload {
  id: number;
  jwtLevel?: number;
  role?: UserRole;
}
