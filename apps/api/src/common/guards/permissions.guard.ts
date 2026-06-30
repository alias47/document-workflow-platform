import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import type { Reflector } from '@nestjs/core';
import type { Request } from 'express';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    const user = req.user;

    if (!user) throw new ForbiddenException('No authenticated user');

    const hasAll = required.every((p) => user.permissions.includes(p));
    if (!hasAll) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
