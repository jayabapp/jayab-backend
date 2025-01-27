import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateAccessControlModuleDto } from './dto/create-rbac-module.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AccessControlList,
  AccessControlModule,
  AccessControlRole,
  Admin,
  AdminRoleNotificationPermission,
  Prisma,
} from '@prisma/client';
import { CreateAccessControlRoleDto } from './dto/create-rbac-role.dto';
import { CreateAccessControlListDto } from './dto/create-rbac.dto';
import { EditAdminDto, SignUpAdminDto } from './dto/signup-admin.dto';
import { hashPassword } from 'src/auth/common/helpers/admin-password-hash.helper';
import { AdminRole } from './common/admin-roles.enum';
import { UpdateRoleNotifPermissionDto } from './dto/update-role-notif-permission.dto';
import { NotificationPermissionList } from 'src/firebase/constants/notif-types';

@Injectable()
export class AccessControlService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   MODULES                                  */
  /* -------------------------------------------------------------------------- */
  /**
   * create rbac module
   * Its better to create in seeder
   * @param dto
   * @returns
   */
  async create(dto: CreateAccessControlModuleDto): Promise<void> {
    await this.db.accessControlModule.upsert({
      where: { key: dto.key },
      create: dto,
      update: { name: dto.name },
    });
    return;
  }

  /**
   * find all rbac modules
   * @returns
   */
  async findAll(): Promise<AccessControlModule[]> {
    const list = await this.db.accessControlModule.findMany({});

    return list;
  }
  /* -------------------------------------------------------------------------- */
  /*                                 MODULES END                                */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                                    ROLES                                   */
  /* -------------------------------------------------------------------------- */

  /**
   * simple create role - only has name
   * @param dto
   * @returns
   */
  async createRole(dto: CreateAccessControlRoleDto, admin: Admin): Promise<void> {
    const role = await this.db.accessControlRole.findFirst({ where: { id: admin.role_id } });

    const upsertedRole = await this.db.accessControlRole.upsert({
      where: { name: dto.name },
      create: dto,
      update: {},
    });

    const tree = `${role.tree}${upsertedRole.id}-`;
    await this.db.accessControlRole.update({ where: { id: upsertedRole.id }, data: { tree } });
    return;
  }

  /**
   * find all rbac roles
   * @returns
   */
  async findAllRoles(selfRole: AccessControlRole): Promise<AccessControlRole[]> {
    const list = await this.db.accessControlRole.findMany({
      where: { tree: { contains: `-${selfRole.id}-` } },
      orderBy: { id: 'asc' },
    });

    const allowedList =
      selfRole.key !== AdminRole.SUPERADMIN ? list.filter((e) => e.tree !== selfRole.tree) : list;
    return allowedList;
  }

  /**
   * find one rbac roles
   * @returns
   */
  async findOneRole(roleId: number): Promise<AccessControlRole> {
    const list = await this.db.accessControlRole.findFirst({ where: { id: roleId } });

    return list;
  }

  /**
   * update role - only has name
   * @param dto
   * @returns
   */
  async updateRole(roleId: number, dto: CreateAccessControlRoleDto): Promise<void> {
    const isDuplicated = await this.db.accessControlRole.findFirst({
      where: { name: dto.name },
    });
    if (isDuplicated) throw new BadRequestException('RBAC5');

    if (roleId == 1) throw new BadRequestException('RBAC6');

    await this.db.accessControlRole.update({
      where: { id: roleId },
      data: dto,
    });
    return;
  }
  /* -------------------------------------------------------------------------- */
  /*                                  ROLES END                                 */
  /* -------------------------------------------------------------------------- */

  /**
   * create rbac list
   * @param dto
   * @returns
   */
  async createRBACList(dto: CreateAccessControlListDto, selfRole: AccessControlRole): Promise<void> {
    const role = await this.db.accessControlRole.findFirst({ where: { id: dto.role_id } });
    if (!role) throw new ForbiddenException();

    if (
      (!role.tree.includes(`-${selfRole.id}-`) || role.tree === selfRole.tree) &&
      role.key !== AdminRole.SUPERADMIN
    )
      throw new ForbiddenException();

    const roleId = +dto.role_id;
    for (const item of dto.list) {
      await this.db.accessControlList.upsert({
        where: { module_id_role_id: { module_id: item.module_id, role_id: roleId } },
        create: { ...item, role_id: roleId },
        update: item,
      });
    }
    return;
  }

  async findOneRBACList(roleId: number, selfRole?: AccessControlRole): Promise<AccessControlList[]> {
    const role = await this.db.accessControlRole.findFirst({ where: { id: roleId } });

    if (!role) throw new ForbiddenException();

    if (
      selfRole &&
      (!role.tree.includes(`-${selfRole.id}-`) || role.tree === selfRole.tree) &&
      role.key !== AdminRole.SUPERADMIN
    )
      throw new ForbiddenException();

    const rbac = await this.db.accessControlList.findMany({
      where: { role_id: roleId },
      include: { module: true },
    });

    return rbac;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   ADMINS                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all admins
   * @returns
   */
  async findAllAdmins(selfRoleId: number): Promise<Admin[]> {
    const admins = await this.db.admin.findMany({
      where: { role: { tree: { contains: `-${selfRoleId}-` } } },
      include: { role: true },
    });

    return admins;
  }

  /**
   * find one admin
   * @param adminId
   * @returns
   */
  async findOneAdmin(adminId: number, selfRoleId: number): Promise<Admin> {
    const admin = await this.db.admin.findFirst({
      where: { id: adminId, role: { tree: { contains: `-${selfRoleId}-` } } },
      include: { role: true },
    });

    if (!admin) throw new NotFoundException('NOT_FOUND');
    return admin;
  }

  /**
   * create admin
   * @param dto
   * @returns
   */
  async signupAdmin(dto: SignUpAdminDto, selfRoleId: number): Promise<void> {
    const isDuplicated = await this.db.admin.findFirst({
      where: { OR: [{ mobile_number: dto.mobile_number }, { username: dto.username }] },
    });
    if (isDuplicated) throw new BadRequestException('ADMIN_AUTH2');

    const role = await this.db.accessControlRole.findFirst({ where: { id: dto.role_id } });
    if (!role) throw new BadRequestException('ADMIN_AUTH5');

    //اگر ادمین در درخت این ادمین نباشد اجازه ویرایش ندارد
    if (!role.tree.includes(`-${selfRoleId}-`)) throw new BadRequestException('ADMIN_AUTH9');

    /**
     * ادمین اجازه ساخت سوپر ادمین را ندارد
     */
    if (role.key == AdminRole.SUPERADMIN) throw new BadRequestException('ADMIN_AUTH4');

    const password = hashPassword(dto.password);
    await this.db.admin.create({ data: { ...dto, password } });

    return;
  }

  /**
   * update admin
   * @param adminId
   * @returns
   */
  async updateAdmin(adminId: number, dto: EditAdminDto, selfRoleId: number): Promise<Admin> {
    const isDuplicated = await this.db.admin.findFirst({
      where: { OR: [{ mobile_number: dto.mobile_number }, { username: dto.username }] },
    });
    if (isDuplicated.id !== adminId) throw new BadRequestException('ADMIN_AUTH2');

    const role = await this.db.accessControlRole.findFirst({ where: { id: dto.role_id } });
    if (!role) throw new BadRequestException('ADMIN_AUTH5');

    //اگر ادمین در درخت این ادمین نباشد اجازه ویرایش ندارد
    if (!role.tree.includes(`-${selfRoleId}-`)) throw new BadRequestException('ADMIN_AUTH9');

    /**
     * ادمین اجازه ساخت سوپر ادمین را ندارد
     */
    if (role.key == AdminRole.SUPERADMIN) throw new BadRequestException('ADMIN_AUTH4');

    let updateData: Prisma.AdminUpdateInput = dto;

    if (dto.password) updateData = { ...updateData, password: hashPassword(dto.password) };

    const admin = await this.db.admin.update({
      where: { id: adminId, role_id: { not: 1 } },
      data: updateData,
    });

    return admin;
  }

  /* -------------------------------------------------------------------------- */
  /*                              NOTIF PERMISSION                              */
  /* -------------------------------------------------------------------------- */
  async findNotifPermissionSelectableItems(): Promise<any> {
    return NotificationPermissionList;
  }

  async findAdminNotifPermission(roleId: number): Promise<any> {
    const np = await this.db.adminRoleNotificationPermission.findFirst({
      where: { role_id: roleId },
      select: { permissions: true },
    });

    return np?.permissions || '';
  }

  async updateAdminRoleNotifPermission(
    dto: UpdateRoleNotifPermissionDto,
  ): Promise<AdminRoleNotificationPermission> {
    const updatedItem = await this.db.adminRoleNotificationPermission.upsert({
      where: { role_id: dto.role_id },
      create: dto,
      update: { permissions: dto.permissions },
    });

    return updatedItem;
  }
}
