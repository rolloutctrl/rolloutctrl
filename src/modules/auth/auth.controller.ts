import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ description: 'Successfully authenticated' })
  @ApiBadRequestResponse({ description: 'Missing email or password' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() body: LoginRequestDto, @Req() req: Request) {
    if (!body?.email) throw new BadRequestException('Missing email');
    if (!body?.password) throw new BadRequestException('Missing password');

    return await this.authService.login(body, req);
  }

  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiOkResponse({ description: 'New access token issued' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid refresh token' })
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
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and invalidate current session' })
  @ApiOkResponse({ description: 'Successfully logged out' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
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
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user active sessions' })
  @ApiOkResponse({ description: 'List of user sessions' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getMySessions(
    @CurrentSessionId() sessionId: string,
    @CurrentUser() user: User,
  ) {
    return this.authService.getUserSessions(user.id, sessionId);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ description: 'Current user payload' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  me(
    @Headers('authorization') authorization: string,
    @CurrentUser() user: JwtUserPayload,
  ) {
    if (!authorization) throw new UnauthorizedException();
    return user;
  }
}
