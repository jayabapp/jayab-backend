import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessControlRole, Admin } from '@prisma/client';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AdminRequestType, RequestType } from 'src/common/interfaces/user.interface';
import { AccessControlService } from './access-control.service';
import { ACCESS_CONTROL_ROUTE_GROUP } from './common/access-control.constant';
import { CreateAccessControlModuleDto } from './dto/create-rbac-module.dto';
import { CreateAccessControlRoleDto } from './dto/create-rbac-role.dto';
import { CreateAccessControlListDto } from './dto/create-rbac.dto';
import { EditAdminDto, SignUpAdminDto } from './dto/signup-admin.dto';
import { UpdateRoleNotifPermissionDto } from './dto/update-role-notif-permission.dto';

@ApiTags('👨‍💻 Access control - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(`admin/${ACCESS_CONTROL_ROUTE_GROUP}`)
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   MODULES                                  */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Create RBAC module' })
  @Post('modules')
  async create(@Body() dto: CreateAccessControlModuleDto): Promise<SuccessResponseArgs> {
    await this.accessControlService.create(dto);
    return { messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Find all RBAC module' })
  @Get('modules')
  async findAll(): Promise<SuccessResponseArgs> {
    const result = await this.accessControlService.findAll();
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                 MODULES END                                */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                                    ROLES                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Create RBAC role' })
  @Post('roles')
  async createRole(
    @Req() req: RequestType,
    @Body() dto: CreateAccessControlRoleDto,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user as unknown as Admin;

    await this.accessControlService.createRole(dto, admin);
    return { messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Find all RBAC role' })
  @Get('roles')
  async findAllRoles(@Req() req: RequestType): Promise<SuccessResponseArgs> {
    const admin = req.user as unknown as Admin & { role: AccessControlRole };

    const result = await this.accessControlService.findAllRoles(admin.role);
    return { result };
  }

  @ApiOperation({ summary: 'Find one RBAC role' })
  @Get('roles/:roleId')
  async findOneRole(@Param('roleId', ParseIntPipe) roleId: number): Promise<SuccessResponseArgs> {
    const result = await this.accessControlService.findOneRole(roleId);
    return { result };
  }

  @ApiOperation({ summary: 'Update one RBAC role' })
  @Put('roles/:roleId')
  async updateOneRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: CreateAccessControlRoleDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.accessControlService.updateRole(roleId, dto);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                  ROLES END                                 */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                                    RBAC                                    */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Create RBAC list' })
  @Post('rbac-list')
  async createRBACList(
    @Req() req: RequestType,
    @Body() dto: CreateAccessControlListDto,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user as unknown as Admin & { role: AccessControlRole };

    await this.accessControlService.createRBACList(dto, admin.role);
    return { messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Find the role RBAC list' })
  @Post('rbac-list/:roleId')
  async findOneRBACList(
    @Req() req: RequestType,
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user as unknown as Admin & { role: AccessControlRole };
    // console.log({ admin });

    const result = await this.accessControlService.findOneRBACList(roleId, admin.role);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   ADMINS                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Signup admin' })
  @Post('admins/signup')
  async signupAdmin(@Req() req: RequestType, @Body() dto: SignUpAdminDto): Promise<SuccessResponseArgs> {
    const admin = req.user as unknown as Admin & { role: AccessControlRole };

    const result = await this.accessControlService.signupAdmin(dto, admin.role_id);
    return { result, messageCode: 'CREATE' };
  }

  @ApiOperation({ summary: 'Find all admins' })
  @Get('admins')
  async findAllAdmins(@Req() req: RequestType): Promise<SuccessResponseArgs> {
    const admin = req.user as unknown as Admin & { role: AccessControlRole };

    const result = await this.accessControlService.findAllAdmins(admin.role_id);
    return { result };
  }

  @ApiOperation({ summary: 'Find one admin' })
  @Get('admins/:adminId')
  async findOneAdmin(
    @Req() req: RequestType,
    @Param('adminId', ParseIntPipe) adminId: number,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user as unknown as Admin & { role: AccessControlRole };

    const result = await this.accessControlService.findOneAdmin(adminId, admin.role_id);
    return { result };
  }

  @ApiOperation({ summary: 'Update admin' })
  @Put('admins/:adminId')
  async updateAdmin(
    @Req() req: RequestType,
    @Param('adminId', ParseIntPipe) adminId: number,
    @Body() dto: EditAdminDto,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user as unknown as Admin & { role: AccessControlRole };

    const result = await this.accessControlService.updateAdmin(adminId, dto, admin.role_id);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                           NOTIFICATION PERMISSION                          */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find notif permission selectable items' })
  @Get('noitification-permissions/:roleId')
  async findAdminRoleNotifPermission(
    @Req() req: AdminRequestType,
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<SuccessResponseArgs> {
    const np = await this.accessControlService.findAdminNotifPermission(roleId);
    const items = await this.accessControlService.findNotifPermissionSelectableItems();

    return { result: { permissions: np, selectable_items: items } };
  }
  @ApiOperation({ summary: 'Update notif permission for ' })
  @Post('noitification-permissions')
  async updateAdminRoleNotifPermission(
    @Req() req: RequestType,
    @Body() dto: UpdateRoleNotifPermissionDto,
  ): Promise<SuccessResponseArgs> {
    await this.accessControlService.updateAdminRoleNotifPermission(dto);

    return { messageCode: 'UPDATE' };
  }
}
