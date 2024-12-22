import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserJwtStrategy } from './strategies/user.strategy';
import { UserAuthJwtStrategy } from './strategies/user-auth.strategy';
import { AdminJwtStrategy } from './strategies/admin.strategy';
import { AuthAdminModule } from './roles/admin/auth-admin.module';
import { UserModule } from './roles/user/auth-user.module';
import { AuthSharedService } from './auth-shared.service';
import { AdminAuthJwtStrategy } from './strategies/admin-auth.strategy';
import { GuestJwtStrategy } from './strategies/guest.strategy';

@Module({
  imports: [JwtModule.register({}), AuthAdminModule, UserModule],
  providers: [
    AdminJwtStrategy,
    AdminAuthJwtStrategy,
    UserJwtStrategy,
    UserAuthJwtStrategy,
    GuestJwtStrategy,
    AuthSharedService,
  ],
})
export class AuthModule {}
