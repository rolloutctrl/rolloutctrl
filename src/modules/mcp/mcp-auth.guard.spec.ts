import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { McpAuthGuard } from './mcp-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ApiKeyType } from 'src/common/generated/prisma/client';
import { createMockPrismaService } from 'src/common/testing/mock-prisma';

/**
 * Tests for McpAuthGuard (Task 3 authentication).
 *
 * Verifies:
 *  - missing/empty API key → 401;
 *  - key not found / revoked / not AGENT type → 401;
 *  - AGENT key without linked user → 401;
 *  - linked user inactive or not an agent → 401;
 *  - valid AGENT key → attaches agent user and scope to request, returns true.
 */
describe('McpAuthGuard', () => {
  let moduleRef: TestingModule;
  let guard: McpAuthGuard;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const rawKey = 'rctrl-agent-testkey';
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

  function mockCtx(headers: Record<string, string | undefined> = {}) {
    const req: any = { headers };
    return {
      switchToHttp: () => ({ getRequest: () => req }),
    } as ExecutionContext;
  }

  beforeEach(async () => {
    prisma = createMockPrismaService();

    moduleRef = await Test.createTestingModule({
      providers: [McpAuthGuard, { provide: PrismaService, useValue: prisma }],
    }).compile();

    guard = moduleRef.get(McpAuthGuard);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('throws 401 when x-api-key header is missing', async () => {
    await expect(guard.canActivate(mockCtx({}))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('throws 401 when x-api-key header is empty', async () => {
    await expect(
      guard.canActivate(mockCtx({ 'x-api-key': '  ' })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws 401 when no matching non-revoked AGENT key exists', async () => {
    prisma.apiKey.findFirst.mockResolvedValueOnce(null);

    await expect(
      guard.canActivate(mockCtx({ 'x-api-key': rawKey })),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prisma.apiKey.findFirst).toHaveBeenCalledWith({
      where: { keyHash, revokedAt: null, type: ApiKeyType.AGENT },
      select: expect.objectContaining({
        projectId: true,
        environmentId: true,
        userId: true,
        previewKey: true,
        project: { select: { slug: true } },
      }),
    });
  });

  it('throws 401 when AGENT key has no linked user', async () => {
    prisma.apiKey.findFirst.mockResolvedValueOnce({
      id: 'key_1',
      projectId: 'proj_1',
      environmentId: null,
      userId: null,
      previewKey: 'rctrl-agent-abc…',
      project: { slug: 'proj-1' },
    });

    await expect(
      guard.canActivate(mockCtx({ 'x-api-key': rawKey })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws 401 when linked user is inactive', async () => {
    prisma.apiKey.findFirst.mockResolvedValueOnce({
      id: 'key_1',
      projectId: 'proj_1',
      environmentId: null,
      userId: 'agent_user_1',
      previewKey: 'rctrl-agent-abc…',
      project: { slug: 'proj-1' },
    });
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'agent_user_1',
      isAgent: true,
      isActive: false,
    });

    await expect(
      guard.canActivate(mockCtx({ 'x-api-key': rawKey })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws 401 when linked user is not an agent', async () => {
    prisma.apiKey.findFirst.mockResolvedValueOnce({
      id: 'key_1',
      projectId: 'proj_1',
      environmentId: null,
      userId: 'agent_user_1',
      previewKey: 'rctrl-agent-abc…',
      project: { slug: 'proj-1' },
    });
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'agent_user_1',
      isAgent: false,
      isActive: true,
    });

    await expect(
      guard.canActivate(mockCtx({ 'x-api-key': rawKey })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches agent user and scope to request and returns true for a valid AGENT key', async () => {
    const agentUser = {
      id: 'agent_user_1',
      email: 'agent@rolloutctrl.local',
      isAgent: true,
      isActive: true,
      organizationId: 'org_1',
    };
    prisma.apiKey.findFirst.mockResolvedValueOnce({
      id: 'key_1',
      projectId: 'proj_1',
      environmentId: 'env_1',
      userId: 'agent_user_1',
      previewKey: 'rctrl-agent-abc123',
      project: { slug: 'proj-1' },
    });
    prisma.user.findUnique.mockResolvedValueOnce(agentUser);

    const ctx = mockCtx({ 'x-api-key': rawKey });
    const req = ctx.switchToHttp().getRequest();

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    // User attached in the same shape JwtStrategy produces.
    expect(req.user).toEqual({ user: agentUser });
    // Scope attached with the key's project (id + slug) and apiKeyPreview.
    expect(req.mcpApiKey).toEqual({
      id: 'key_1',
      projectId: 'proj_1',
      projectSlug: 'proj-1',
      environmentId: 'env_1',
      apiKeyPreview: 'rctrl-agent-abc123',
    });
  });
});
