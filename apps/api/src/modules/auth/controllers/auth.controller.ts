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

import { ChangePasswordDto } from '../dto/change-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { LoginDto } from '../dto/login.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';

import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import type { Request, Response } from 'express';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { APP_CONFIG_KEY, type AppConfig } from '@/config/app.config';
import { JWT_CONFIG_KEY, type JwtConfig } from '@/config/jwt.config';

// Cookie names used across login, refresh, and logout.
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

/** Milliseconds derived from the JWT refresh expiry string (e.g. "7d"). */
function refreshExpiryMs(expiry: string): number {
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1), 10);
  if (unit === 'd') return value * 86_400_000;
  if (unit === 'h') return value * 3_600_000;
  return value * 60_000;
}

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
@SkipThrottle()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
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

    // Access token cookie. The JWT inside is short-lived (15 min); the cookie
    // itself is given the refresh window as maxAge so it survives a browser
    // restart. That lets middleware treat the user as "possibly authenticated"
    // and defer to the client-side /auth/me + silent-refresh flow, rather than
    // hard-bouncing to /login the moment the browser reopens.
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: refreshMaxAge,
    });

    // Refresh token — persisted for the configured window (default 7 days).
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/api/v1/auth/refresh',
      maxAge: refreshMaxAge,
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/v1/auth/refresh' });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: 'Staff login — sets HttpOnly auth cookies' })
  async login(
    @Body() dto: LoginDto,
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
        staff: result.staff,
      },
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate tokens using the refresh cookie' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const rawToken = cookies[REFRESH_TOKEN_COOKIE];
    if (!rawToken) throw new UnauthorizedException('No refresh token provided');
    const tokens = await this.authService.refresh(rawToken, req.ip, req.headers['user-agent']);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return { success: true, message: 'Token refreshed', data: null };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Logout — revokes refresh token and clears cookies' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const rawToken = cookies[REFRESH_TOKEN_COOKIE];
    if (rawToken) {
      await this.authService.logout(rawToken);
    }
    this.clearAuthCookies(res);
    return { success: true, message: 'Logged out successfully', data: null };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Logout from all devices — revokes all tokens' })
  async logoutAll(@CurrentUser() user: JwtPayload, @Res({ passthrough: true }) res: Response) {
    await this.authService.logoutAll(user.sub);
    this.clearAuthCookies(res);
    return { success: true, message: 'All sessions revoked', data: null };
  }

  @Get('me')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get current authenticated staff profile' })
  async me(@CurrentUser() user: JwtPayload) {
    const staff = await this.authService.getMe(user.sub);
    return { success: true, message: 'Profile retrieved', data: staff };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Change password' })
  async changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(user.sub, dto);
    return { success: true, message: 'Password changed successfully', data: null };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { ttl: 60_000, limit: 3 } })
  @ApiOperation({ summary: 'Request password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email, this.defaultOrgId);
    return {
      success: true,
      message: 'If the email exists, a reset link has been sent.',
      data: null,
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { success: true, message: 'Password reset successfully', data: null };
  }
}
