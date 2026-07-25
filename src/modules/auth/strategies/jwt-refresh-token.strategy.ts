import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';
import {
  JwtRefreshGuardData,
  JwtSessionPayload,
} from 'src/common/types/common';
import { AUTH_REFRESH_COOKIE_NAME } from '../auth.constants';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.[AUTH_REFRESH_COOKIE_NAME];
        },
      ]),
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
      ignoreExpiration: true,
    });
  }

  async validate(
    request: Request,
    payload: JwtSessionPayload,
  ): Promise<JwtRefreshGuardData> {
    const refreshToken = request.cookies?.[AUTH_REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const session = await this.authService.findActiveSessionBySessionId(
      payload.sessionId,
    );
    if (!session || session.revokedAt) {
      throw new UnauthorizedException('Invalid session');
    }

    if (session.userId !== payload.sub) {
      throw new UnauthorizedException('Token mismatch');
    }

    await this.authService.updateSessionLastUsed(session.id);

    return {
      userId: payload.sub,
      sessionId: payload.sessionId,
      session,
      refreshToken,
      tokenExpired: this.isTokenExpired(payload.exp),
    };
  }

  private isTokenExpired(exp: number): boolean {
    return Date.now() >= exp * 1000;
  }
}
