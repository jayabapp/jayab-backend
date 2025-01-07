import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Property } from '@prisma/client';
import { PartialUser } from 'src/common/interfaces/user.interface';

export type PropertyInterceptorData = Property & {};

@Injectable()
export class OwnerUpdatePropertyInterceptor implements NestInterceptor {
  constructor(private readonly db: PrismaService) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as PartialUser;

    const propertyId = +request.body?.property_id || +request.params?.propertyId;
    if (!propertyId) throw new BadRequestException('PROPERTY_INTERCEPTOR1');

    const property = await this.db.property.findFirst({ where: { id: propertyId } });
    if (!property) throw new ForbiddenException('PROPERTY_INTERCEPTOR2');
    if (property.owner_id !== user.owner_id) throw new ForbiddenException('PROPERTY_INTERCEPTOR3');

    request.interceptor_data = property;

    return next.handle();
  }
}
