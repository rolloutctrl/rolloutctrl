import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { VariantPayloadType } from 'src/common/generated/prisma/enums';
import {
  evaluateAction,
  evaluateFeatureFlag,
  EvaluationReason,
} from '@rolloutctrl/evaluator';
import { AccessService } from './access.service';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService } from 'src/common/testing/mock-prisma';
import { createMockRedis, MockRedis } from 'src/common/testing/mock-redis';
import { SDK_CACHE_PREFIX } from '../sdk/services/sdk.service';

jest.mock('@rolloutctrl/evaluator');

const mockedEvaluateAction = evaluateAction as jest.MockedFunction<
  typeof evaluateAction
>;
const mockedEvaluateFeatureFlag = evaluateFeatureFlag as jest.MockedFunction<
  typeof evaluateFeatureFlag
>;

describe('AccessService', () => {
  let service: AccessService;
  let moduleRef: TestingModule;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let redis: MockRedis;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    redis = createMockRedis();

    moduleRef = await Test.createTestingModule({
      providers: [
        AccessService,
        { provide: PrismaService, useValue: prisma },
        { provide: 'REDIS_CLIENT', useValue: redis },
      ],
    }).compile();

    service = moduleRef.get(AccessService);
    jest.clearAllMocks();
  });

  afterEach(() => moduleRef.close());

  describe('can', () => {
    const baseInput = {
      action: 'flag:read',
      environment: 'production',
      projectId: 'proj-1',
      roles: ['admin'],
      userId: 'user-1',
      attributes: { country: 'US' },
    };

    function seedConfig(overrides: { actions?: any; flags?: any } = {}) {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'proj-1' });
      redis.get.mockResolvedValueOnce(
        JSON.stringify({
          project: { id: 'proj-1' },
          flags: {},
          actions: overrides.actions ?? {},
        }),
      );
    }

    it('returns ACTION_NOT_FOUND when action missing from config', async () => {
      seedConfig({ actions: {} });
      const result = await service.can(baseInput);
      expect(result).toEqual({ allowed: false, reason: ['ACTION_NOT_FOUND'] });
      expect(mockedEvaluateAction).not.toHaveBeenCalled();
    });

    it('returns allowed=true when evaluator returns ALLOW', async () => {
      seedConfig({
        actions: {
          'flag:read': {
            id: 'a1',
            key: 'flag:read',
            enabled: true,
            defaultEffect: 'ALLOW',
            strategies: [],
          },
        },
      });
      mockedEvaluateAction.mockReturnValueOnce({
        effect: 'ALLOW',
        strategyId: 'strat-1',
      });
      const result = await service.can(baseInput);
      expect(result.allowed).toBe(true);
      expect(result.reason).toEqual(['STRATEGY_MATCH:strat-1']);
    });

    it('returns allowed=false with DEFAULT_EFFECT when no strategy matched', async () => {
      seedConfig({
        actions: {
          'flag:read': {
            id: 'a1',
            key: 'flag:read',
            enabled: true,
            defaultEffect: 'DENY',
            strategies: [],
          },
        },
      });
      mockedEvaluateAction.mockReturnValueOnce({
        effect: 'DENY',
        strategyId: null,
      });
      const result = await service.can(baseInput);
      expect(result).toEqual({ allowed: false, reason: ['DEFAULT_EFFECT'] });
    });

    it('passes attributes + userId into evaluation context', async () => {
      seedConfig({
        actions: {
          'flag:read': {
            id: 'a1',
            key: 'flag:read',
            enabled: true,
            defaultEffect: 'DENY',
            strategies: [],
          },
        },
      });
      mockedEvaluateAction.mockReturnValueOnce({
        effect: 'ALLOW',
        strategyId: null,
      });
      await service.can(baseInput);
      expect(mockedEvaluateAction).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'flag:read' }),
        expect.objectContaining({ country: 'US', userId: 'user-1' }),
      );
    });
  });

  describe('evaluateFlag', () => {
    const baseInput = {
      flagKey: 'my-flag',
      environment: 'production',
      projectId: 'proj-1',
      userId: 'user-1',
      attributes: { country: 'US' },
    };

    function seedConfig(flags: any) {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'proj-1' });
      redis.get.mockResolvedValueOnce(
        JSON.stringify({ project: { id: 'proj-1' }, flags, actions: {} }),
      );
    }

    it('returns FLAG_NOT_FOUND when flag missing', async () => {
      seedConfig({});
      const result = await service.evaluateFlag(baseInput);
      expect(result).toEqual({ enabled: false, reason: 'FLAG_NOT_FOUND' });
    });

    it('returns FLAG_DISABLED when evaluator reason is DISABLED_FLAG', async () => {
      seedConfig({ 'my-flag': { enabled: true, strategies: [] } });
      mockedEvaluateFeatureFlag.mockReturnValueOnce({
        enabled: false,
        reason: EvaluationReason.DISABLED_FLAG,
      });
      const result = await service.evaluateFlag(baseInput);
      expect(result).toEqual({ enabled: false, reason: 'FLAG_DISABLED' });
    });

    it('returns NO_STRATEGY_MATCH when disabled for other reason', async () => {
      seedConfig({ 'my-flag': { enabled: true, strategies: [] } });
      mockedEvaluateFeatureFlag.mockReturnValueOnce({
        enabled: false,
        reason: EvaluationReason.STRATEGY_NOT_MATCHED,
      });
      const result = await service.evaluateFlag(baseInput);
      expect(result).toEqual({ enabled: false, reason: 'NO_STRATEGY_MATCH' });
    });

    it('returns NO_STRATEGIES when flag enabled without strategies', async () => {
      seedConfig({ 'my-flag': { enabled: true, strategies: [] } });
      mockedEvaluateFeatureFlag.mockReturnValueOnce({
        enabled: true,
        reason: EvaluationReason.NO_STRATEGIES,
      });
      const result = await service.evaluateFlag(baseInput);
      expect(result).toEqual({ enabled: true, reason: 'NO_STRATEGIES' });
    });

    it('returns VARIANT_ASSIGNED with strategy + variant when variant present', async () => {
      seedConfig({ 'my-flag': { enabled: true, strategies: [] } });
      const strategy = { id: 's1', name: 'strat' };
      const variant = {
        id: 'v1',
        name: 'control',
        payload: 'on',
        payloadType: 'STRING',
      };
      mockedEvaluateFeatureFlag.mockReturnValueOnce({
        enabled: true,
        reason: EvaluationReason.VARIANT_ASSIGNED,
        strategy,
        variant,
      });
      const result = await service.evaluateFlag(baseInput);
      expect(result.enabled).toBe(true);
      expect(result.reason).toBe('VARIANT_ASSIGNED:s1:v1');
      expect(result.strategy).toEqual(strategy);
      expect(result.variant).toEqual(variant);
    });

    it('returns STRATEGY_MATCH when no variant but strategy matched', async () => {
      seedConfig({ 'my-flag': { enabled: true, strategies: [] } });
      mockedEvaluateFeatureFlag.mockReturnValueOnce({
        enabled: true,
        reason: EvaluationReason.STRATEGY_MATCH,
        strategy: { id: 's1', name: 'strat' },
      });
      const result = await service.evaluateFlag(baseInput);
      expect(result.enabled).toBe(true);
      expect(result.reason).toBe('STRATEGY_MATCH:s1');
    });

    it('defaults kind to "user" and key to userId when omitted', async () => {
      seedConfig({ 'my-flag': { enabled: true, strategies: [] } });
      mockedEvaluateFeatureFlag.mockReturnValueOnce({
        enabled: true,
        reason: EvaluationReason.NO_STRATEGIES,
      });
      await service.evaluateFlag(baseInput);
      expect(mockedEvaluateFeatureFlag).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ kind: 'user', key: 'user-1' }),
      );
    });
  });

  describe('resolveProjectIdFromApiKey', () => {
    it('throws BadRequest when apiKey empty', async () => {
      await expect(service.resolveProjectIdFromApiKey('')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resolveProjectIdFromApiKey('   ')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws Unauthorized when key not found', async () => {
      prisma.apiKey.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.resolveProjectIdFromApiKey('secret'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns projectId on valid key', async () => {
      prisma.apiKey.findFirst.mockResolvedValueOnce({ projectId: 'proj-x' });
      const id = await service.resolveProjectIdFromApiKey('secret');
      expect(id).toBe('proj-x');
      // sha256 hash of 'secret'
      const expectedHash =
        '2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b';
      expect(prisma.apiKey.findFirst).toHaveBeenCalledWith({
        where: { keyHash: expectedHash, revokedAt: null },
        select: { projectId: true },
      });
    });
  });

  describe('getConfig (via can) - cache & validation', () => {
    it('throws BadRequest when projectId missing', async () => {
      await expect(
        service.can({
          action: 'x',
          environment: 'prod',
          projectId: '',
          roles: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when environment missing', async () => {
      await expect(
        service.can({
          action: 'x',
          environment: '  ',
          projectId: 'p1',
          roles: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFound when project not found', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.can({
          action: 'x',
          environment: 'prod',
          projectId: 'missing',
          roles: [],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFound when environment not found (cache miss)', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1' });
      redis.get.mockResolvedValueOnce(null);
      prisma.environment.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.can({
          action: 'x',
          environment: 'prod',
          projectId: 'p1',
          roles: [],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('fetches from DB on cache miss and writes cache', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1' });
      redis.get.mockResolvedValueOnce(null);
      const envRecord = {
        project: { id: 'p1', actions: [] },
        featureFlags: [
          {
            id: 'ffe-1',
            featureFlag: { id: 'ff-1', key: 'flag-a', variants: [] },
            enabled: true,
            strategies: [],
          },
        ],
      };
      prisma.environment.findFirst.mockResolvedValueOnce(envRecord);
      const result = await service.can({
        action: 'x',
        environment: 'prod',
        projectId: 'p1',
        roles: [],
      });
      expect(result).toEqual({ allowed: false, reason: ['ACTION_NOT_FOUND'] });
      expect(redis.setex).toHaveBeenCalledWith(
        'access:config:p1:prod',
        3600,
        expect.any(String),
      );
      // Verify flags map built with key
      const cachedArg = redis.setex.mock.calls[0][2];
      const parsed = JSON.parse(cachedArg);
      expect(parsed.flags['flag-a']).toMatchObject({
        enabled: true,
        _featureFlagEnvironmentId: 'ffe-1',
        _featureFlagId: 'ff-1',
      });
    });

    it('continues on Redis read error (falls back to DB)', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1' });
      redis.get.mockRejectedValueOnce(new Error('redis down'));
      prisma.environment.findFirst.mockResolvedValueOnce({
        project: { id: 'p1', actions: [] },
        featureFlags: [],
      });
      const result = await service.can({
        action: 'x',
        environment: 'prod',
        projectId: 'p1',
        roles: [],
      });
      expect(result).toEqual({ allowed: false, reason: ['ACTION_NOT_FOUND'] });
    });

    it('continues on Redis write error', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1' });
      redis.get.mockResolvedValueOnce(null);
      prisma.environment.findFirst.mockResolvedValueOnce({
        project: { id: 'p1', actions: [] },
        featureFlags: [],
      });
      redis.setex.mockRejectedValueOnce(new Error('redis down'));
      await expect(
        service.can({
          action: 'x',
          environment: 'prod',
          projectId: 'p1',
          roles: [],
        }),
      ).resolves.toBeDefined();
    });
  });

  describe('buildFlagsMap (via getConfig)', () => {
    it('filters archived strategies and segments', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1' });
      redis.get.mockResolvedValueOnce(null);
      prisma.environment.findFirst.mockResolvedValueOnce({
        project: { id: 'p1', actions: [] },
        featureFlags: [
          {
            id: 'ffe-1',
            featureFlag: { id: 'ff-1', key: 'f', variants: [] },
            enabled: true,
            strategies: [
              {
                id: 's1',
                name: 'active',
                isArchived: false,
                enabled: true,
                priority: 1,
                matchType: 'ALL',
                rolloutPercentage: null,
                rolloutStickinessField: null,
                timezone: null,
                startsAt: null,
                endsAt: null,
                isDefault: false,
                segments: [
                  { id: 'seg-1', key: 's', isArchived: false, rules: [] },
                  { id: 'seg-2', key: 'archived', isArchived: true, rules: [] },
                ],
                rules: [],
                strategyVariants: [],
              },
              {
                id: 's2',
                name: 'archived',
                isArchived: true,
                enabled: true,
                segments: [],
                rules: [],
                strategyVariants: [],
              },
            ],
          },
        ],
      });
      await service.can({
        action: 'x',
        environment: 'prod',
        projectId: 'p1',
        roles: [],
      });
      const cached = JSON.parse(redis.setex.mock.calls[0][2]);
      const flag = cached.flags['f'];
      expect(flag.strategies).toHaveLength(1);
      expect(flag.strategies[0].id).toBe('s1');
      expect(flag.strategies[0].segments).toHaveLength(1);
      expect(flag.strategies[0].segments[0].id).toBe('seg-1');
    });

    it('parses JSON payload for JSON variant type', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1' });
      redis.get.mockResolvedValueOnce(null);
      prisma.environment.findFirst.mockResolvedValueOnce({
        project: { id: 'p1', actions: [] },
        featureFlags: [
          {
            id: 'ffe-1',
            featureFlag: { id: 'ff-1', key: 'f', variants: [] },
            enabled: true,
            strategies: [
              {
                id: 's1',
                name: 'n',
                isArchived: false,
                enabled: true,
                priority: 1,
                matchType: 'ALL',
                rolloutPercentage: null,
                rolloutStickinessField: null,
                timezone: null,
                startsAt: null,
                endsAt: null,
                isDefault: false,
                segments: [],
                rules: [],
                strategyVariants: [
                  {
                    id: 'sv-1',
                    weight: 100,
                    isArchived: false,
                    variant: {
                      id: 'v-1',
                      name: 'on',
                      payload: '{"color":"red"}',
                      payloadType: VariantPayloadType.JSON,
                      isArchived: false,
                    },
                  },
                ],
              },
            ],
          },
        ],
      });
      await service.can({
        action: 'x',
        environment: 'prod',
        projectId: 'p1',
        roles: [],
      });
      const cached = JSON.parse(redis.setex.mock.calls[0][2]);
      const sv = cached.flags['f'].strategies[0].strategyVariants[0];
      expect(sv.variant.payload).toEqual({ color: 'red' });
    });
  });

  describe('invalidateCache', () => {
    it('deletes the cache key', async () => {
      await service.invalidateCache('p1', 'prod');
      expect(redis.del).toHaveBeenCalledWith('access:config:p1:prod');
    });

    it('swallows Redis errors', async () => {
      redis.del.mockRejectedValueOnce(new Error('boom'));
      await expect(
        service.invalidateCache('p1', 'prod'),
      ).resolves.toBeUndefined();
    });
  });

  describe('clearAllCache', () => {
    it('deletes all matching keys', async () => {
      redis.keys.mockResolvedValueOnce([
        'access:config:p1:prod',
        'access:config:p1:staging',
      ]);
      await service.clearAllCache();
      expect(redis.del).toHaveBeenCalledWith(
        'access:config:p1:prod',
        'access:config:p1:staging',
      );
    });

    it('does nothing when no keys', async () => {
      redis.keys.mockResolvedValueOnce([]);
      await service.clearAllCache();
      expect(redis.del).not.toHaveBeenCalled();
    });
  });

  describe('invalidateCacheByProject', () => {
    it('invalidates access + SDK cache for every environment', async () => {
      prisma.environment.findMany.mockResolvedValueOnce([
        { id: 'e1', name: 'prod' },
        { id: 'e2', name: 'staging' },
      ]);
      await service.invalidateCacheByProject('p1');
      expect(redis.del).toHaveBeenCalledWith('access:config:p1:prod');
      expect(redis.del).toHaveBeenCalledWith('access:config:p1:staging');
      expect(redis.del).toHaveBeenCalledWith(`${SDK_CACHE_PREFIX}e1`);
      expect(redis.del).toHaveBeenCalledWith(`${SDK_CACHE_PREFIX}e2`);
    });
  });

  describe('getPublicConfig', () => {
    it('throws BadRequest when apiKey missing', async () => {
      await expect(service.getPublicConfig('', 'prod')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequest when environment missing', async () => {
      await expect(service.getPublicConfig('k', '  ')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws Unauthorized when env missing and key not found', async () => {
      prisma.environment.findFirst.mockResolvedValueOnce(null);
      prisma.apiKey.findFirst.mockResolvedValueOnce(null);
      await expect(service.getPublicConfig('k', 'prod')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws NotFound when env missing but key valid', async () => {
      prisma.environment.findFirst.mockResolvedValueOnce(null);
      prisma.apiKey.findFirst.mockResolvedValueOnce({ id: 'key-1' });
      await expect(service.getPublicConfig('k', 'prod')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns public config with flags + actions maps', async () => {
      prisma.environment.findFirst.mockResolvedValueOnce({
        name: 'prod',
        version: 3,
        project: { id: 'p1', actions: [] },
        featureFlags: [
          {
            id: 'ffe-1',
            featureFlag: { id: 'ff-1', key: 'flag-a', variants: [] },
            enabled: true,
            strategies: [],
          },
        ],
      });
      const result = await service.getPublicConfig('k', 'prod');
      expect(result.environment).toBe('prod');
      expect(result.version).toBe(3);
      expect(result.flags['flag-a']).toMatchObject({ enabled: true });
    });
  });
});
