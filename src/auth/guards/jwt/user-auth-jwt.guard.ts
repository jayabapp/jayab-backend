import { AuthGuard } from '@nestjs/passport';

export class UserAuthJwtGuard extends AuthGuard('user-auth-jwt') {}
