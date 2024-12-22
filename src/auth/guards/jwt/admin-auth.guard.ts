import { AuthGuard } from '@nestjs/passport';

export class AdminAuthJwtGuard extends AuthGuard('admin-auth-jwt') {}
