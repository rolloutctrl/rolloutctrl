import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentSessionId } from 'src/common/decorators/current-session-id.decorator';
import { JwtRefreshGuardData, JwtUserPayload } from 'src/common/types/common';
import { JwtRefreshGuard } from 'src/common/guards/jwt-refresh.guard';
import { User } from 'src/common/generated/prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(@Body() body: LoginRequestDto, @Req() req: Request) {
    if (!body?.email) throw new BadRequestException('Missing email');
    if (!body?.password) throw new BadRequestException('Missing password');

    return await this.authService.login(body, req);
  }

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: Request) {
    const { userId, sessionId, refreshToken, tokenExpired } =
      req.user as JwtRefreshGuardData;
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    const { accessToken } = await this.authService.refresh(
      userId,
      sessionId,
      refreshToken,
      tokenExpired,
      req,
    );

    return { accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: JwtUserPayload,
    @CurrentSessionId() sessionId: string,
    @Req() req: Request,
  ) {
    await this.authService.logout(sessionId);

    const logOutCookie = this.authService.getCookiesForLogOut();
    req.res?.setHeader('Set-Cookie', logOutCookie);

    return { ok: true };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  getMySessions(
    @CurrentSessionId() sessionId: string,
    @CurrentUser() user: User,
  ) {
    return this.authService.getUserSessions(user.id, sessionId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @Headers('authorization') authorization: string,
    @CurrentUser() user: JwtUserPayload,
  ) {
    if (!authorization) throw new UnauthorizedException();
    return user;
  }
}
