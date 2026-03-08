import { AuthGuard } from '@nestjs/passport';

export class MianJwtGuard extends AuthGuard('mian-jwt') {}
