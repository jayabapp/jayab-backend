import { AdminAuthJwtStrategy } from './strategies/admin-auth.strategy';
import { UserAuthJwtStrategy } from './strategies/user-auth.strategy';
import { AuthSharedService } from './auth-shared.service';
import { AdminJwtStrategy } from './strategies/admin.strategy';
import { GuestJwtStrategy } from './strategies/guest.strategy';
import { TestAccessModule } from 'src/test-access/test-access.module';
import { UserJwtStrategy } from './strategies/user.strategy';
import { MianJwtStrategy } from './strategies/mian.strategy';
import { AuthAdminModule } from './roles/admin/auth-admin.module';
import { UserModule } from './roles/user/auth-user.module';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';

@Module({
  imports: [JwtModule.register({}), AuthAdminModule, UserModule, TestAccessModule],
  providers: [
    UserJwtStrategy,
    MianJwtStrategy,
    AdminJwtStrategy,
    GuestJwtStrategy,
    AuthSharedService,
    UserAuthJwtStrategy,
    AdminAuthJwtStrategy,
  ],
})
export class AuthModule {}
