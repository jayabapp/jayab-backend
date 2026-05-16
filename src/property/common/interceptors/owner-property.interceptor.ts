import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Property } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export type PropertyInterceptorData = Property & {};

@Injectable()
export class OwnerUpdatePropertyInterceptor implements NestInterceptor {
  constructor(private readonly db: PrismaService) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const propertyId = +request.body?.property_id || +request.params?.propertyId;
    if (!propertyId) throw new BadRequestException('PROPERTY_INTERCEPTOR1');

    const property = await this.db.property.findFirst({ where: { id: propertyId } });
    if (!property) throw new ForbiddenException('PROPERTY_INTERCEPTOR2');
    if (property.owner_id !== user.owner_id) throw new ForbiddenException('PROPERTY_INTERCEPTOR3');

    request.interceptor_data = property;

    return next.handle();
  }
}
