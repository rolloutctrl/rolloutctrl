import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_REFRESH_COOKIE_NAME } from './auth.constants';
import { createMockPrismaService } from 'src/common/testing/mock-prisma';
import { createMockConfigService } from 'src/common/testing/mock-config';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const mockedBcrypt = bcrypt as unknown as {
  compare: jest.Mock;
  hash: jest.Mock;
};

function mockReq(overrides: any = {}) {
  const setHeader = jest.fn();
  return {
    headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' },
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
    res: { setHeader },
    ...overrides,
  } as any;
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let jwtService: jest.Mocked<JwtService>;
  let config: ReturnType<typeof createMockConfigService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    jwtService = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;
    config = createMockConfigService({
      USER_PASSWORD_SALT_ROUNDS: '5',
      JWT_ACCESS_TOKEN_SECRET: 'access-secret',
      JWT_ACCESS_TOKEN_EXPIRATION_TIME: '15m',
      JWT_REFRESH_TOKEN_SECRET: 'refresh-secret',
      JWT_REFRESH_TOKEN_EXPIRATION_TIME: '7d',
      NODE_ENV: 'development',
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = { email: 'User@Example.com', password: 'pass' };

    it('throws BadRequest when email missing', async () => {
      await expect(
        service.login({ email: '', password: 'p' } as any, mockReq()),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when password missing', async () => {
      await expect(
        service.login({ email: 'a@b.com', password: '' } as any, mockReq()),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFound when user not found', async () => {
      prisma.user.findFirst.mockResolvedValueOnce(null);
      await expect(service.login(loginDto, mockReq())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('revokes sessions and throws when account deactivated', async () => {
      prisma.user.findFirst.mockResolvedValueOnce({
        id: 'u1',
        isActive: false,
        password: 'hash',
      });
      prisma.session.deleteMany.mockResolvedValueOnce({ count: 0 });
      await expect(service.login(loginDto, mockReq())).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.session.deleteMany).toHaveBeenCalled();
    });

    it('throws Unauthorized on wrong password', async () => {
      prisma.user.findFirst.mockResolvedValueOnce({
        id: 'u1',
        isActive: true,
        password: 'hash',
      });
      mockedBcrypt.compare.mockResolvedValueOnce(false);
      await expect(service.login(loginDto, mockReq())).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns accessToken and sets refresh cookie on success', async () => {
      prisma.user.findFirst.mockResolvedValueOnce({
        id: 'u1',
        isActive: true,
        password: 'hash',
      });
      mockedBcrypt.compare.mockResolvedValueOnce(true);
      jwtService.signAsync.mockResolvedValue('refresh-token');
      // createSession path
      prisma.user.findFirst.mockResolvedValueOnce({
        id: 'u1',
        isActive: true,
      });
      prisma.session.findMany.mockResolvedValueOnce([]); // enforceSessionLimit
      prisma.session.create.mockResolvedValueOnce({ id: 'sess-1' });

      const req = mockReq();
      const result = await service.login(loginDto, req);

      expect(result).toEqual({ accessToken: 'refresh-token' });
      expect(req.res.setHeader).toHaveBeenCalledWith('Set-Cookie', [
        expect.stringContaining(`${AUTH_REFRESH_COOKIE_NAME}=refresh-token`),
      ]);
      expect(mockedBcrypt.hash).toHaveBeenCalled();
    });

    it('normalizes email to lowercase trimmed', async () => {
      prisma.user.findFirst.mockResolvedValueOnce(null);
      await service
        .login(
          { email: '  User@Example.com  ', password: 'p' } as any,
          mockReq(),
        )
        .catch(() => {});
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
    });
  });

  describe('refresh', () => {
    it('throws Unauthorized when refresh token missing', async () => {
      await expect(
        service.refresh('u1', 's1', '', false, mockReq()),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws Unauthorized when session not found', async () => {
      prisma.session.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.refresh('u1', 's1', 'rt', false, mockReq()),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws Unauthorized when session revoked', async () => {
      prisma.session.findFirst.mockResolvedValueOnce({
        id: 's1',
        revokedAt: new Date(),
        refreshTokenHash: 'h',
      });
      await expect(
        service.refresh('u1', 's1', 'rt', false, mockReq()),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws Unauthorized when refresh token does not match hash', async () => {
      prisma.session.findFirst.mockResolvedValueOnce({
        id: 's1',
        revokedAt: null,
        refreshTokenHash: 'h',
      });
      mockedBcrypt.compare.mockResolvedValueOnce(false);
      await expect(
        service.refresh('u1', 's1', 'rt', false, mockReq()),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rotates refresh token when tokenExpired=true', async () => {
      prisma.session.findFirst.mockResolvedValueOnce({
        id: 's1',
        revokedAt: null,
        refreshTokenHash: 'h',
      });
      mockedBcrypt.compare.mockResolvedValueOnce(true);
      jwtService.signAsync.mockResolvedValue('new-rt');
      mockedBcrypt.hash.mockResolvedValueOnce('new-hash');
      const req = mockReq();
      const result = await service.refresh('u1', 's1', 'rt', true, req);
      expect(result).toEqual({ accessToken: 'new-rt' });
      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: expect.objectContaining({ refreshTokenHash: 'new-hash' }),
      });
      expect(req.res.setHeader).toHaveBeenCalled();
    });

    it('only updates lastUsedAt when token not expired', async () => {
      prisma.session.findFirst.mockResolvedValueOnce({
        id: 's1',
        revokedAt: null,
        refreshTokenHash: 'h',
      });
      mockedBcrypt.compare.mockResolvedValueOnce(true);
      jwtService.signAsync.mockResolvedValue('at');
      const req = mockReq();
      await service.refresh('u1', 's1', 'rt', false, req);
      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { lastUsedAt: expect.any(Date) },
      });
      expect(req.res.setHeader).not.toHaveBeenCalled();
    });
  });

  describe('getCookiesForLogOut', () => {
    it('uses SameSite=Lax in development', () => {
      config.get.mockImplementation((k: string) =>
        k === 'NODE_ENV' ? 'development' : undefined,
      );
      const cookies = service.getCookiesForLogOut();
      expect(cookies).toHaveLength(1);
      expect(cookies[0]).toContain('Max-Age=0');
      expect(cookies[0]).toContain('SameSite=Lax');
    });

    it('uses SameSite=None; Secure in production', () => {
      config.get.mockImplementation((k: string) =>
        k === 'NODE_ENV' ? 'production' : undefined,
      );
      const cookies = service.getCookiesForLogOut();
      expect(cookies[0]).toContain('SameSite=None; Secure');
    });
  });

  describe('logout', () => {
    it('is a no-op when sessionId empty', async () => {
      await service.logout('');
      expect(prisma.session.updateMany).not.toHaveBeenCalled();
    });

    it('revokes active session', async () => {
      prisma.session.updateMany.mockResolvedValueOnce({ count: 1 });
      await service.logout('s1');
      expect(prisma.session.updateMany).toHaveBeenCalledWith({
        where: { id: 's1', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('getRefreshCookieName', () => {
    it('returns the constant', () => {
      expect(service.getRefreshCookieName()).toBe(AUTH_REFRESH_COOKIE_NAME);
    });
  });

  describe('getCookieWithJwtRefreshToken', () => {
    it('parses "7d" suffix into seconds', async () => {
      jwtService.signAsync.mockResolvedValue('rt');
      const { refreshTokenCookie } = await service.getCookieWithJwtRefreshToken(
        'u1',
        's1',
      );
      expect(refreshTokenCookie).toContain('Max-Age=604800');
    });

    it('parses "12h" suffix into seconds', async () => {
      config.get.mockImplementation((k: string) =>
        k === 'JWT_REFRESH_TOKEN_EXPIRATION_TIME' ? '12h' : undefined,
      );
      jwtService.signAsync.mockResolvedValue('rt');
      const { refreshTokenCookie } = await service.getCookieWithJwtRefreshToken(
        'u1',
        's1',
      );
      expect(refreshTokenCookie).toContain('Max-Age=43200');
    });

    it('parses "30m" suffix into seconds', async () => {
      config.get.mockImplementation((k: string) =>
        k === 'JWT_REFRESH_TOKEN_EXPIRATION_TIME' ? '30m' : undefined,
      );
      jwtService.signAsync.mockResolvedValue('rt');
      const { refreshTokenCookie } = await service.getCookieWithJwtRefreshToken(
        'u1',
        's1',
      );
      expect(refreshTokenCookie).toContain('Max-Age=1800');
    });

    it('parses "90s" suffix into seconds', async () => {
      config.get.mockImplementation((k: string) =>
        k === 'JWT_REFRESH_TOKEN_EXPIRATION_TIME' ? '90s' : undefined,
      );
      jwtService.signAsync.mockResolvedValue('rt');
      const { refreshTokenCookie } = await service.getCookieWithJwtRefreshToken(
        'u1',
        's1',
      );
      expect(refreshTokenCookie).toContain('Max-Age=90');
    });

    it('falls back to parseInt for plain numbers', async () => {
      config.get.mockImplementation((k: string) =>
        k === 'JWT_REFRESH_TOKEN_EXPIRATION_TIME' ? '3600' : undefined,
      );
      jwtService.signAsync.mockResolvedValue('rt');
      const { refreshTokenCookie } = await service.getCookieWithJwtRefreshToken(
        'u1',
        's1',
      );
      expect(refreshTokenCookie).toContain('Max-Age=3600');
    });
  });

  describe('createSession', () => {
    it('throws NotFound when user not found', async () => {
      prisma.user.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.createSession('u-missing', 's1', 'hash', mockReq()),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws Unauthorized when user inactive', async () => {
      prisma.user.findFirst.mockResolvedValueOnce({
        id: 'u1',
        isActive: false,
      });
      await expect(
        service.createSession('u1', 's1', 'hash', mockReq()),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('cleans expired sessions, enforces limit, then creates', async () => {
      prisma.user.findFirst.mockResolvedValueOnce({ id: 'u1', isActive: true });
      prisma.session.deleteMany.mockResolvedValueOnce({ count: 0 }); // cleanup
      prisma.session.findMany.mockResolvedValueOnce([]); // enforce limit
      prisma.session.create.mockResolvedValueOnce({ id: 's1' });

      const session = await service.createSession(
        'u1',
        's1',
        'hash',
        mockReq(),
      );
      expect(session).toEqual({ id: 's1' });
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: expect.objectContaining({ userId: 'u1' }),
      });
      expect(prisma.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 's1',
          userId: 'u1',
          refreshTokenHash: 'hash',
          deviceName: 'Mac',
        }),
      });
    });

    it('extracts Mobile device name from user-agent', async () => {
      prisma.user.findFirst.mockResolvedValueOnce({ id: 'u1', isActive: true });
      prisma.session.deleteMany.mockResolvedValueOnce({ count: 0 });
      prisma.session.findMany.mockResolvedValueOnce([]);
      prisma.session.create.mockResolvedValueOnce({ id: 's1' });

      const req = mockReq({
        headers: { 'user-agent': 'Mozilla/5.0 (iPhone; Mobile)' },
      });
      await service.createSession('u1', 's1', 'hash', req);
      expect(prisma.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ deviceName: 'Mobile Device' }),
      });
    });

    it('returns null device name when user-agent missing', async () => {
      prisma.user.findFirst.mockResolvedValueOnce({ id: 'u1', isActive: true });
      prisma.session.deleteMany.mockResolvedValueOnce({ count: 0 });
      prisma.session.findMany.mockResolvedValueOnce([]);
      prisma.session.create.mockResolvedValueOnce({ id: 's1' });

      const req = mockReq({ headers: {}, socket: {} });
      await service.createSession('u1', 's1', 'hash', req);
      expect(prisma.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ deviceName: null }),
      });
    });
  });

  describe('session helpers', () => {
    describe('findActiveSessionBySessionId', () => {
      it('returns session when found', async () => {
        prisma.session.findFirst.mockResolvedValueOnce({ id: 's1' });
        const result = await service.findActiveSessionBySessionId('s1');
        expect(result).toEqual({ id: 's1' });
      });

      it('returns null when not found', async () => {
        prisma.session.findFirst.mockResolvedValueOnce(null);
        const result = await service.findActiveSessionBySessionId('missing');
        expect(result).toBeNull();
      });
    });

    describe('updateSessionLastUsed', () => {
      it('updates lastUsedAt', async () => {
        await service.updateSessionLastUsed('s1');
        expect(prisma.session.update).toHaveBeenCalledWith({
          where: { id: 's1' },
          data: { lastUsedAt: expect.any(Date) },
        });
      });
    });

    describe('deleteSession', () => {
      it('deletes by id', async () => {
        await service.deleteSession('s1');
        expect(prisma.session.delete).toHaveBeenCalledWith({
          where: { id: 's1' },
        });
      });
    });

    describe('getUserSessions', () => {
      it('maps isCurrent and computes total', async () => {
        prisma.session.findMany.mockResolvedValueOnce([
          { id: 's1' },
          { id: 's2' },
        ]);
        const result = await service.getUserSessions('u1', 's1');
        expect(result.total).toBe(2);
        expect(result.sessions[0]).toMatchObject({ id: 's1', isCurrent: true });
        expect(result.sessions[1]).toMatchObject({
          id: 's2',
          isCurrent: false,
        });
      });
    });

    describe('revokeSession', () => {
      it('throws NotFound when session not found', async () => {
        prisma.session.findFirst.mockResolvedValueOnce(null);
        await expect(service.revokeSession('u1', 's1')).rejects.toThrow(
          NotFoundException,
        );
      });

      it('deletes session when found', async () => {
        prisma.session.findFirst.mockResolvedValueOnce({ id: 's1' });
        await service.revokeSession('u1', 's1');
        expect(prisma.session.delete).toHaveBeenCalledWith({
          where: { id: 's1' },
        });
      });
    });

    describe('revokeAllSessions', () => {
      it('deletes all sessions for user', async () => {
        await service.revokeAllSessions('u1');
        expect(prisma.session.deleteMany).toHaveBeenCalledWith({
          where: { userId: 'u1' },
        });
      });

      it('excludes the given session id when provided', async () => {
        await service.revokeAllSessions('u1', 'keep');
        expect(prisma.session.deleteMany).toHaveBeenCalledWith({
          where: { userId: 'u1', NOT: { id: 'keep' } },
        });
      });
    });
  });
});
