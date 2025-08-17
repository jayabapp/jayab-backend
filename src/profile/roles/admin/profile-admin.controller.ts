import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { ProfileAdminService } from './profile-admin.service';
import { PROFILE_ADMIN_ROUTE_GROUP } from 'src/profile/common/route-group.constant';
import { RequestType } from 'src/common/interfaces/user.interface';
import { AccessControlService } from 'src/access-control/access-control.service';
import { AccessControlRole, Admin } from '@prisma/client';

@ApiTags('👨‍💻 Profiles - ADMIN')
@ApiBearerAuth('admin-jwt')
@UseGuards(AdminJwtGuard)
@Controller(PROFILE_ADMIN_ROUTE_GROUP)
export class ProfileAdminController {
  constructor(
    private readonly profileAdminService: ProfileAdminService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @ApiOperation({ summary: 'Find admin profile' })
  @Get()
  async profile(@Req() req: RequestType): Promise<SuccessResponseArgs> {
    const admin = req.user;
    const result = await this.profileAdminService.profile(admin.id);
    return { result: result, messageCode: 'ADMIN_AUTH2' };
  }

  @ApiOperation({ summary: 'Find admin rbac list' })
  @Get('rbac-list')
  async findAccess(@Req() req: RequestType): Promise<SuccessResponseArgs> {
    const admin = req.user as unknown as Admin & { role: AccessControlRole };
    const rbac = await this.accessControlService.findOneRBACList(admin.role_id);
    return { result: { rbac, admin } };
  }
}
