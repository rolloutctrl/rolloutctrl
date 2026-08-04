import { UnauthorizedException } from '@nestjs/common';
import { JwtRefreshTokenStrategy } from './jwt-refresh-token.strategy';
import { AUTH_REFRESH_COOKIE_NAME } from '../auth.constants';
import { createMockConfigService } from 'src/common/testing/mock-config';

describe('JwtRefreshTokenStrategy', () => {
  let strategy: JwtRefreshTokenStrategy;
  let authService: {
    findActiveSessionBySessionId: jest.Mock;
    updateSessionLastUsed: jest.Mock;
  };
  let config: ReturnType<typeof createMockConfigService>;

  beforeEach(() => {
    authService = {
      findActiveSessionBySessionId: jest.fn(),
      updateSessionLastUsed: jest.fn(),
    };
    config = createMockConfigService({
      JWT_REFRESH_TOKEN_SECRET: 'refresh-secret',
    });
    strategy = new JwtRefreshTokenStrategy(config as any, authService as any);
  });

  function mockReq(cookies: Record<string, string> = {}) {
    return { cookies } as any;
  }

  describe('validate', () => {
    it('throws Unauthorized when refresh token cookie missing', async () => {
      await expect(
        strategy.validate(mockReq(), { sub: 'u1', sessionId: 's1' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws Unauthorized when session not found', async () => {
      authService.findActiveSessionBySessionId.mockResolvedValueOnce(null);
      await expect(
        strategy.validate(mockReq({ [AUTH_REFRESH_COOKIE_NAME]: 'rt' }), {
          sub: 'u1',
          sessionId: 's1',
        } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws Unauthorized when session revoked', async () => {
      authService.findActiveSessionBySessionId.mockResolvedValueOnce({
        id: 's1',
        revokedAt: new Date(),
        userId: 'u1',
      });
      await expect(
        strategy.validate(mockReq({ [AUTH_REFRESH_COOKIE_NAME]: 'rt' }), {
          sub: 'u1',
          sessionId: 's1',
        } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws Unauthorized when session userId != payload.sub', async () => {
      authService.findActiveSessionBySessionId.mockResolvedValueOnce({
        id: 's1',
        revokedAt: null,
        userId: 'other-user',
      });
      await expect(
        strategy.validate(mockReq({ [AUTH_REFRESH_COOKIE_NAME]: 'rt' }), {
          sub: 'u1',
          sessionId: 's1',
        } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns guard data and updates lastUsedAt on success', async () => {
      const session = { id: 's1', revokedAt: null, userId: 'u1' };
      authService.findActiveSessionBySessionId.mockResolvedValueOnce(session);
      const result = await strategy.validate(
        mockReq({ [AUTH_REFRESH_COOKIE_NAME]: 'rt' }),
        {
          sub: 'u1',
          sessionId: 's1',
          exp: Math.floor(Date.now() / 1000) + 3600,
        } as any,
      );
      expect(result).toEqual({
        userId: 'u1',
        sessionId: 's1',
        session,
        refreshToken: 'rt',
        tokenExpired: false,
      });
      expect(authService.updateSessionLastUsed).toHaveBeenCalledWith('s1');
    });

    it('sets tokenExpired=true when exp is in the past', async () => {
      authService.findActiveSessionBySessionId.mockResolvedValueOnce({
        id: 's1',
        revokedAt: null,
        userId: 'u1',
      });
      const result = await strategy.validate(
        mockReq({ [AUTH_REFRESH_COOKIE_NAME]: 'rt' }),
        { sub: 'u1', sessionId: 's1', exp: 1 } as any,
      );
      expect(result.tokenExpired).toBe(true);
    });
  });
});
