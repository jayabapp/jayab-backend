import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PartialUser } from 'src/common/interfaces/user.interface';
import { OwnerStatus } from 'src/owner/common/owner-status.type';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly db: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract user from request (e.g., attached by a middleware)
    const user = request.user as PartialUser;

    // Check if user exists
    if (!user?.owner_id) throw new ForbiddenException('FORBIDDEN');

    // check owner status
    const owner = await this.db.owner.findFirst({ where: { id: user.owner_id }, select: { status: true } });
    if (owner.status !== OwnerStatus.APPROVED) throw new ForbiddenException('FORBIDDEN');

    return true;
  }
}
