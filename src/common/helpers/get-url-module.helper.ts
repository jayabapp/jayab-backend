import { ForbiddenException } from '@nestjs/common';

export function getModuleFromUrl(originalUrl: string): string {
  const EXCLUDE_ROUTES = ['signin', 'signup'];

  let url: string = originalUrl.split('?')[0];
  if (!url.includes('admin')) return;

  url = url.replace(/\/api\/v[0-9]\/admin\//g, '');
  if (!url) return;

  const targetModule = url?.split('/')[0];
  if (!targetModule) throw new ForbiddenException('RBAC1');

  if (EXCLUDE_ROUTES.includes(targetModule)) return;

  return targetModule;
}
