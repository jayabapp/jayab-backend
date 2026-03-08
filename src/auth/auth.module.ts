import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthSharedService } from './auth-shared.service';
import { AuthAdminModule } from './roles/admin/auth-admin.module';
import { UserModule } from './roles/user/auth-user.module';
import { AdminAuthJwtStrategy } from './strategies/admin-auth.strategy';
import { AdminJwtStrategy } from './strategies/admin.strategy';
import { GuestJwtStrategy } from './strategies/guest.strategy';
import { MianJwtStrategy } from './strategies/mian.strategy';
import { UserAuthJwtStrategy } from './strategies/user-auth.strategy';
import { UserJwtStrategy } from './strategies/user.strategy';

@Module({
  imports: [JwtModule.register({}), AuthAdminModule, UserModule],
  providers: [
    AdminJwtStrategy,
    AdminAuthJwtStrategy,
    UserJwtStrategy,
    UserAuthJwtStrategy,
    GuestJwtStrategy,
    AuthSharedService,
    MianJwtStrategy,
  ],
})
export class AuthModule {}
