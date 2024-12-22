import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Admin, PrismaClient } from '@prisma/client';
import { isEmpty } from 'lodash';
const prisma = new PrismaClient();
/**
 * this interceptor check rbac on admin
 */
@Injectable()
export class RBACInterceptor implements NestInterceptor {
  private readonly EXCLUDE_ROUTES = ['signin', 'signup', 'profile', 'auth'];

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const admin = request.user as Admin;

    /**
     * pathname
     * remove prefix
     * get target module name
     */
    let url: string = request.originalUrl.split('?')[0];
    if (!url.includes('admin')) return next.handle();

    url = url.replace(/\/api\/v[0-9]\/admin\//g, '');
    if (!url) return next.handle();

    const targetModule = url?.split('/')[0];

    if (!targetModule) throw new ForbiddenException('RBAC1');
    if (this.EXCLUDE_ROUTES.includes(targetModule)) return next.handle();

    /**
     * find module that match by targetModule in url
     */
    const module = await prisma.accessControlModule.findFirst({ where: { key: targetModule } });
    if (!module) throw new ForbiddenException('RBAC1');

    /**
     * find admin role and acl list according to module id
     */
    const role = await prisma.accessControlRole.findFirst({
      where: { id: admin.role_id },
      include: { acl: { where: { module_id: module.id } } },
    });

    if (isEmpty(role.acl)) throw new ForbiddenException('RBAC2');

    /**
     * check access according to request method
     */
    let hasAccess = false;
    const rbac = role.acl[0]; //because in accessControlList table roleId and moduleId is unique
    switch (request.method.toUpperCase()) {
      case 'GET':
        hasAccess = rbac.r;
        break;
      case 'POST':
        hasAccess = rbac.c;
        break;
      case 'PUT':
      case 'PATCH':
        hasAccess = rbac.u;
        break;
      case 'DELETE':
        hasAccess = rbac.d;
        break;

      default:
        break;
    }

    if (!hasAccess) throw new ForbiddenException('RBAC3');

    request['adminRbac'] = role.acl[0];

    return next.handle();
  }
}
