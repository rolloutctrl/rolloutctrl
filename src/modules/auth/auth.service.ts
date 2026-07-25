import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_REFRESH_COOKIE_NAME } from './auth.constants';
import { JwtSessionPayload } from 'src/common/types/common';
import { Request } from 'express';
import { Session } from 'src/common/generated/prisma/client';
import { LoginRequestDto } from './dto/login.dto';
import {
  SessionsListResponseDto,
  SessionWithoutRefreshToken,
} from './dto/session.dto';

@Injectable()
export class AuthService {
  private readonly MAX_SESSIONS_PER_USER = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    input: LoginRequestDto,
    req: Request,
  ): Promise<{
    accessToken: string;
  }> {
    const email = input.email?.trim().toLowerCase();
    if (!email) throw new BadRequestException('Missing email');
    if (!input.password) throw new BadRequestException('Missing password');

    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) throw new NotFoundException('User not found');

    if (!user.isActive) {
      await this.revokeAllSessions(user.id);
      throw new UnauthorizedException('Account is deactivated');
    }

    const ok = await bcrypt.compare(input.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const sessionId = randomUUID();

    const { refreshTokenCookie, refreshToken } =
      await this.getCookieWithJwtRefreshToken(user.id, sessionId);

    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      Number(this.configService.getOrThrow('USER_PASSWORD_SALT_ROUNDS')),
    );

    await this.createSession(user.id, sessionId, refreshTokenHash, req);

    const accessToken = await this.signAccessToken({
      sub: user.id,
      sessionId,
    });

    req.res?.setHeader('Set-Cookie', [refreshTokenCookie]);

    return { accessToken };
  }

  async refresh(
    userId: string,
    sessionId: string,
    refreshToken: string,
    tokenExpired: boolean,
    req: Request,
  ): Promise<{
    accessToken: string;
  }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const session = await this.findActiveSessionBySessionId(sessionId);

    if (!session || session.revokedAt) {
      throw new UnauthorizedException('Session revoked');
    }

    const isValidRefreshToken = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );
    if (!isValidRefreshToken)
      throw new UnauthorizedException('Invalid refresh token');

    if (tokenExpired) {
      const { refreshToken: newRefreshToken, refreshTokenCookie } =
        await this.getCookieWithJwtRefreshToken(userId, sessionId);

      const newRefreshTokenHash = await bcrypt.hash(
        newRefreshToken,
        Number(this.configService.getOrThrow('USER_PASSWORD_SALT_ROUNDS')),
      );

      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          refreshTokenHash: newRefreshTokenHash,
          lastUsedAt: new Date(),
        },
      });

      req.res?.setHeader('Set-Cookie', [refreshTokenCookie]);
    } else {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { lastUsedAt: new Date() },
      });
    }

    const accessToken = await this.signAccessToken({
      sub: userId,
      sessionId: sessionId,
    });

    return { accessToken };
  }

  public getCookiesForLogOut() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const sameSiteFlags = isProduction
      ? 'SameSite=None; Secure'
      : 'SameSite=Lax';
    const logoutCookie = `${AUTH_REFRESH_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; ${sameSiteFlags}`;
    return [logoutCookie];
  }

  async logout(sessionId: string): Promise<void> {
    if (!sessionId) return;

    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  getRefreshCookieName() {
    return AUTH_REFRESH_COOKIE_NAME;
  }

  private async signAccessToken(payload: JwtSessionPayload) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      ),
    });
  }

  private async signRefreshToken(payload: JwtSessionPayload) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      ),
    });
  }

  async getCookieWithJwtRefreshToken(userId: string, sessionId: string) {
    const payload: JwtSessionPayload = {
      sub: userId,
      sessionId,
    };
    const refreshToken = await this.signRefreshToken(payload);

    const expiresInConfig =
      this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') || '604800';
    let maxAgeSeconds: number;
    if (expiresInConfig.endsWith('d')) {
      maxAgeSeconds = parseInt(expiresInConfig) * 24 * 60 * 60;
    } else if (expiresInConfig.endsWith('h')) {
      maxAgeSeconds = parseInt(expiresInConfig) * 60 * 60;
    } else if (expiresInConfig.endsWith('m')) {
      maxAgeSeconds = parseInt(expiresInConfig) * 60;
    } else if (expiresInConfig.endsWith('s')) {
      maxAgeSeconds = parseInt(expiresInConfig);
    } else {
      maxAgeSeconds = parseInt(expiresInConfig);
    }

    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const sameSiteFlags = isProduction
      ? 'SameSite=None; Secure'
      : 'SameSite=Lax';
    const refreshTokenCookie = `${AUTH_REFRESH_COOKIE_NAME}=${refreshToken}; HttpOnly; Path=/; Max-Age=${maxAgeSeconds}; ${sameSiteFlags}`;

    return {
      refreshTokenCookie,
      refreshToken,
    };
  }

  async createSession(
    userId: string,
    sessionId: string,
    refreshTokenHash: string,
    req: Request,
  ): Promise<Session> {
    const expiresInConfig =
      this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') || '604800';

    let expiresInSeconds: number;
    if (expiresInConfig.endsWith('d')) {
      expiresInSeconds = parseInt(expiresInConfig) * 24 * 60 * 60;
    } else if (expiresInConfig.endsWith('h')) {
      expiresInSeconds = parseInt(expiresInConfig) * 60 * 60;
    } else if (expiresInConfig.endsWith('m')) {
      expiresInSeconds = parseInt(expiresInConfig) * 60;
    } else if (expiresInConfig.endsWith('s')) {
      expiresInSeconds = parseInt(expiresInConfig);
    } else {
      expiresInSeconds = parseInt(expiresInConfig);
    }

    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const deviceName = this.extractDeviceName(req.headers['user-agent']);
    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = req.ip || req.socket?.remoteAddress || null;

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }

    await this.cleanupExpiredSessions(userId);
    await this.enforceSessionLimit(userId);

    const session = await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshTokenHash,
        deviceName,
        expiresAt,
        ip: ipAddress,
        userAgent,
        lastUsedAt: new Date(),
      },
    });

    return session;
  }

  async findActiveSessionBySessionId(
    sessionId: string,
  ): Promise<Session | null> {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });
    if (!session) {
      return null;
    }
    return session;
  }

  async updateSessionLastUsed(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { lastUsedAt: new Date() },
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }

  async getUserSessions(
    userId: string,
    currentSessionId?: string,
  ): Promise<SessionsListResponseDto> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { lastUsedAt: 'desc' },
      omit: {
        refreshTokenHash: true,
      },
    });

    const sessionDtos: SessionWithoutRefreshToken[] = sessions.map(
      (session) => ({
        ...session,
        isCurrent: session.id === currentSessionId,
      }),
    );

    return {
      sessions: sessionDtos,
      total: sessions.length,
    };
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.deleteSession(sessionId);
  }

  async revokeAllSessions(
    userId: string,
    exceptSessionId?: string,
  ): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        userId: userId,
        ...(exceptSessionId && {
          NOT: {
            id: exceptSessionId,
          },
        }),
      },
    });
  }

  private async cleanupExpiredSessions(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  private async enforceSessionLimit(userId: string): Promise<void> {
    const sessionsToDelete = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { lastUsedAt: 'desc' },
      skip: this.MAX_SESSIONS_PER_USER - 1,
      select: { id: true },
    });

    if (sessionsToDelete.length > 0) {
      await this.prisma.session.deleteMany({
        where: {
          id: {
            in: sessionsToDelete.map((s) => s.id),
          },
        },
      });
    }
  }

  private extractDeviceName(userAgent?: string): string | null {
    if (!userAgent) return null;

    if (userAgent.includes('Mobile')) return 'Mobile Device';
    if (userAgent.includes('Tablet')) return 'Tablet';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Macintosh')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux PC';

    return 'Unknown Device';
  }
}
