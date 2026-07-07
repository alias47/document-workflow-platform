import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

import { ApplicantChangePasswordDto } from '../dto/applicant-change-password.dto';
import { ApplicantLoginDto } from '../dto/applicant-login.dto';
import { ApplicantJwtGuard } from '../guards/applicant-jwt.guard';
import { ApplicantAuthService } from '../services/applicant-auth.service';

import type { ApplicantJwtPayload } from '../interfaces/applicant-jwt-payload.interface';
import type { Request, Response } from 'express';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { APP_CONFIG_KEY, type AppConfig } from '@/config/app.config';
import { JWT_CONFIG_KEY, type JwtConfig } from '@/config/jwt.config';

export const APPLICANT_ACCESS_TOKEN_COOKIE = 'applicant_access_token';
export const APPLICANT_REFRESH_TOKEN_COOKIE = 'applicant_refresh_token';

function refreshExpiryMs(expiry: string): number {
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1), 10);
  if (unit === 'd') return value * 86_400_000;
  if (unit === 'h') return value * 3_600_000;
  return value * 60_000;
}

@ApiTags('Applicant Auth')
@Controller('applicant-auth')
@Public()
@SkipThrottle()
export class ApplicantAuthController {
  constructor(
    private readonly authService: ApplicantAuthService,
    private readonly config: ConfigService,
  ) {}

  private get defaultOrgId(): string {
    const cfg = this.config.get<AppConfig>(APP_CONFIG_KEY);
    if (!cfg) throw new Error('App config not loaded');
    return cfg.defaultOrganizationId;
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const jwtCfg = this.config.get<JwtConfig>(JWT_CONFIG_KEY) as JwtConfig;
    const appCfg = this.config.get<AppConfig>(APP_CONFIG_KEY) as AppConfig;
    const refreshMaxAge = refreshExpiryMs(jwtCfg.refreshExpiresIn);
    const secure = appCfg.cookieSecure;

    res.cookie(APPLICANT_ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: refreshMaxAge,
    });

    res.cookie(APPLICANT_REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/api/v1/applicant-auth/refresh',
      maxAge: refreshMaxAge,
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie(APPLICANT_ACCESS_TOKEN_COOKIE, { path: '/' });
    res.clearCookie(APPLICANT_REFRESH_TOKEN_COOKIE, {
      path: '/api/v1/applicant-auth/refresh',
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: 'Applicant login — sets HttpOnly auth cookies' })
  async login(
    @Body() dto: ApplicantLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(
      dto,
      this.defaultOrgId,
      req.ip,
      req.headers['user-agent'],
    );
    this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    return {
      success: true,
      message: 'Login successful',
      data: {
        mustChangePassword: result.mustChangePass,
        profile: result.profile,
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate applicant tokens using the refresh cookie' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const rawToken = cookies[APPLICANT_REFRESH_TOKEN_COOKIE];
    if (!rawToken) throw new UnauthorizedException('No refresh token provided');
    const tokens = await this.authService.refresh(rawToken, req.ip, req.headers['user-agent']);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return { success: true, message: 'Token refreshed', data: null };
  }

  @Post('logout')
  @UseGuards(ApplicantJwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Logout — revokes refresh token and clears cookies' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const rawToken = cookies[APPLICANT_REFRESH_TOKEN_COOKIE];
    if (rawToken) {
      await this.authService.logout(rawToken);
    }
    this.clearAuthCookies(res);
    return { success: true, message: 'Logged out successfully', data: null };
  }

  @Get('me')
  @UseGuards(ApplicantJwtGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get current authenticated applicant profile' })
  async me(@CurrentUser() user: ApplicantJwtPayload) {
    const profile = await this.authService.getMe(user.sub);
    return { success: true, message: 'Profile retrieved', data: profile };
  }

  @Post('change-password')
  @UseGuards(ApplicantJwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Change applicant password' })
  async changePassword(
    @CurrentUser() user: ApplicantJwtPayload,
    @Body() dto: ApplicantChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.changePassword(user.sub, dto);
    this.clearAuthCookies(res);
    return { success: true, message: 'Password changed successfully', data: null };
  }
}
