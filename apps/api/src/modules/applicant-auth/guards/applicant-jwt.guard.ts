import { type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { APPLICANT_JWT_STRATEGY } from '../strategies/applicant-jwt.strategy';

import type { Observable } from 'rxjs';

@Injectable()
export class ApplicantJwtGuard extends AuthGuard(APPLICANT_JWT_STRATEGY) {
  override canActivate(ctx: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(ctx);
  }

  override handleRequest<T>(err: Error | null, user: T): T {
    if (err || !user) throw err ?? new UnauthorizedException('Applicant authentication required');
    return user;
  }
}
