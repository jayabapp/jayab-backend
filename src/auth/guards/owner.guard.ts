import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Extract user from request (e.g., attached by a middleware)
    const user = request.user as User;

    // Check if user exists
    if (!user.owner_id) return false;

    return true; // Allow access if user exists
  }
}
