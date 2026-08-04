import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SdkKeyGuard } from './sdk-key.guard';
import { createMockPrismaService } from 'src/common/testing/mock-prisma';

describe('SdkKeyGuard', () => {
  let guard: SdkKeyGuard;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    guard = new SdkKeyGuard(prisma as any);
  });

  function mockContext(headers: Record<string, string> = {}) {
    const request = { headers };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  it('throws Unauthorized when x-api-key header missing', async () => {
    await expect(guard.canActivate(mockContext({}))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws Unauthorized when x-api-key is empty/whitespace', async () => {
    await expect(
      guard.canActivate(mockContext({ 'x-api-key': '   ' })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws Unauthorized when API key not found in DB', async () => {
    prisma.apiKey.findFirst.mockResolvedValueOnce(null);
    await expect(
      guard.canActivate(mockContext({ 'x-api-key': 'secret' })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('attaches apiKeyRecord to request and returns true on valid key', async () => {
    const apiKeyRecord = {
      id: 'k1',
      projectId: 'p1',
      type: 'SERVER',
      environmentId: 'e1',
      allowedOrigins: [],
    };
    prisma.apiKey.findFirst.mockResolvedValueOnce(apiKeyRecord);
    const ctx = mockContext({ 'x-api-key': 'secret' });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    const request = ctx.switchToHttp().getRequest();
    expect(request.sdkApiKey).toEqual(apiKeyRecord);
  });

  it('hashes the API key with sha256 before lookup', async () => {
    prisma.apiKey.findFirst.mockResolvedValueOnce({
      id: 'k1',
      projectId: 'p1',
      type: 'SERVER',
      environmentId: 'e1',
      allowedOrigins: [],
    });
    await guard.canActivate(mockContext({ 'x-api-key': 'secret' }));
    const expectedHash =
      '2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b';
    expect(prisma.apiKey.findFirst).toHaveBeenCalledWith({
      where: { keyHash: expectedHash, revokedAt: null },
      select: {
        id: true,
        projectId: true,
        type: true,
        environmentId: true,
        allowedOrigins: true,
      },
    });
  });
});
