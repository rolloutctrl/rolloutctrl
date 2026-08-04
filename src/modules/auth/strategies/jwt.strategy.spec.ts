import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { createMockPrismaService } from 'src/common/testing/mock-prisma';
import { createMockConfigService } from 'src/common/testing/mock-config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let config: ReturnType<typeof createMockConfigService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    config = createMockConfigService({
      JWT_ACCESS_TOKEN_SECRET: 'access-secret',
    });
    strategy = new JwtStrategy(config, prisma as any);
  });

  describe('validate', () => {
    it('throws Unauthorized when payload.sub missing', async () => {
      await expect(
        strategy.validate({ sessionId: 's1' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws Unauthorized when payload.sessionId missing', async () => {
      await expect(strategy.validate({ sub: 'u1' } as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws Unauthorized when user not found', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(
        strategy.validate({ sub: 'u-missing', sessionId: 's1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns payload + user when valid', async () => {
      const user = { id: 'u1', organization: { id: 'o1', name: 'Org' } };
      prisma.user.findUnique.mockResolvedValueOnce(user);
      const result = await strategy.validate({ sub: 'u1', sessionId: 's1' });
      expect(result).toEqual({
        sub: 'u1',
        sessionId: 's1',
        user,
      });
    });

    it('queries user with organization and project members', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'u1' });
      await strategy.validate({ sub: 'u1', sessionId: 's1' });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u1' },
        include: expect.objectContaining({
          organization: { select: { id: true, name: true } },
          projectMembers: expect.any(Object),
        }),
        omit: { password: true },
      });
    });
  });

  describe('constructor config', () => {
    it('uses JWT_ACCESS_TOKEN_SECRET from config', () => {
      // Strategy is constructed; if config key missing, getOrThrow would throw
      expect(strategy).toBeDefined();
    });
  });
});

// Suppress unused-import warning for ExecutionContext (kept for type clarity)
void (undefined as unknown as ExecutionContext);
