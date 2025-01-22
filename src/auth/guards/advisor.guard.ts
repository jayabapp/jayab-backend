import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdvisorStatus } from 'src/advisor/common/advisor-status.type';
import { PartialUser } from 'src/common/interfaces/user.interface';
import { OwnerStatus } from 'src/owner/common/owner-status.type';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdvisorGuard implements CanActivate {
  constructor(private readonly db: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract user from request (e.g., attached by a middleware)
    const user = request.user as PartialUser;

    // Check if advisor exists
    if (!user?.advisor_id) throw new ForbiddenException('FORBIDDEN');

    // check owner status
    const advisor = await this.db.advisor.findFirst({
      where: { id: user.advisor_id },
      select: { status: true, subscription_expired_at: true },
    });
    if (advisor.status !== AdvisorStatus.APPROVED) throw new ForbiddenException('FORBIDDEN');

    return true;
  }
}
