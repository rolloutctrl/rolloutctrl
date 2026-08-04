import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SdkService, SDK_CACHE_PREFIX } from './sdk.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MetricsService } from '../../metrics/metrics.service';
import { createMockPrismaService } from 'src/common/testing/mock-prisma';
import { createMockRedis, MockRedis } from 'src/common/testing/mock-redis';

describe('SdkService', () => {
  let service: SdkService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let redis: MockRedis;
  let metricsService: { incrementBy: jest.Mock };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    redis = createMockRedis();
    metricsService = { incrementBy: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SdkService,
        { provide: PrismaService, useValue: prisma },
        { provide: 'REDIS_CLIENT', useValue: redis },
        { provide: MetricsService, useValue: metricsService },
      ],
    }).compile();

    service = moduleRef.get(SdkService);
    jest.clearAllMocks();
  });

  describe('getConfig', () => {
    it('throws NotFound when environment not found', async () => {
      prisma.environment.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.getConfig({ projectId: 'p1' }, 'prod'),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns cached config on cache hit', async () => {
      prisma.environment.findFirst.mockResolvedValueOnce({
        id: 'e1',
        name: 'prod',
        version: 3,
      });
      const cachedConfig = { version: 3, flags: {}, actions: {} };
      redis.get.mockResolvedValueOnce(JSON.stringify(cachedConfig));

      const result = await service.getConfig({ projectId: 'p1' }, 'prod');
      expect(result).toEqual(cachedConfig);
      expect(prisma.environment.findUnique).not.toHaveBeenCalled();
    });

    it('builds config from DB on cache miss and writes cache', async () => {
      prisma.environment.findFirst.mockResolvedValueOnce({
        id: 'e1',
        name: 'prod',
        version: 3,
      });
      redis.get.mockResolvedValueOnce(null);
      prisma.environment.findUnique.mockResolvedValueOnce({
        name: 'prod',
        version: 3,
        project: { id: 'p1', actions: [] },
        featureFlags: [
          {
            id: 'ffe1',
            featureFlag: { id: 'ff1', key: 'flag-a', variants: [] },
            enabled: true,
            strategies: [],
          },
        ],
      });

      const result = await service.getConfig({ projectId: 'p1' }, 'prod');
      expect(result.environment).toBe('prod');
      expect(result.version).toBe(3);
      expect(result.flags['flag-a']).toMatchObject({ enabled: true });
      expect(redis.set).toHaveBeenCalledWith(
        `${SDK_CACHE_PREFIX}e1`,
        expect.any(String),
      );
    });

    it('continues on Redis read error (falls back to DB)', async () => {
      prisma.environment.findFirst.mockResolvedValueOnce({
        id: 'e1',
        name: 'prod',
        version: 1,
      });
      redis.get.mockRejectedValueOnce(new Error('redis down'));
      prisma.environment.findUnique.mockResolvedValueOnce({
        name: 'prod',
        version: 1,
        project: { id: 'p1', actions: [] },
        featureFlags: [],
      });

      const result = await service.getConfig({ projectId: 'p1' }, 'prod');
      expect(result.environment).toBe('prod');
    });

    it('continues on Redis write error', async () => {
      prisma.environment.findFirst.mockResolvedValueOnce({
        id: 'e1',
        name: 'prod',
        version: 1,
      });
      redis.get.mockResolvedValueOnce(null);
      prisma.environment.findUnique.mockResolvedValueOnce({
        name: 'prod',
        version: 1,
        project: { id: 'p1', actions: [] },
        featureFlags: [],
      });
      redis.set.mockRejectedValueOnce(new Error('redis down'));

      await expect(
        service.getConfig({ projectId: 'p1' }, 'prod'),
      ).resolves.toBeDefined();
    });
  });

  describe('getConfigChanges', () => {
    it('throws NotFound when environment not found', async () => {
      prisma.environment.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.getConfigChanges({ projectId: 'p1' }, 'prod', 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns hasChanges=true when cached version differs from since', async () => {
      prisma.environment.findFirst.mockResolvedValueOnce({
        id: 'e1',
        name: 'prod',
        version: 5,
      });
      redis.get.mockResolvedValueOnce(JSON.stringify({ version: 5 }));
      const result = await service.getConfigChanges(
        { projectId: 'p1' },
        'prod',
        3,
      );
      expect(result).toEqual({ version: 5, hasChanges: true });
    });

    it('returns hasChanges=false when version matches since', async () => {
      prisma.environment.findFirst.mockResolvedValueOnce({
        id: 'e1',
        name: 'prod',
        version: 5,
      });
      redis.get.mockResolvedValueOnce(JSON.stringify({ version: 5 }));
      const result = await service.getConfigChanges(
        { projectId: 'p1' },
        'prod',
        5,
      );
      expect(result).toEqual({ version: 5, hasChanges: false });
    });

    it('falls back to DB version when Redis read fails', async () => {
      prisma.environment.findFirst.mockResolvedValueOnce({
        id: 'e1',
        name: 'prod',
        version: 7,
      });
      redis.get.mockRejectedValueOnce(new Error('redis down'));
      const result = await service.getConfigChanges(
        { projectId: 'p1' },
        'prod',
        5,
      );
      expect(result).toEqual({ version: 7, hasChanges: true });
    });
  });

  describe('trackEvaluations', () => {
    it('calls incrementBy for each evaluation in parallel', async () => {
      const evaluations = [
        {
          featureFlagEnvironmentId: 'ffe1',
          featureFlagId: 'ff1',
          strategyId: 's1',
          variantId: 'v1',
          type: 'EVALUATION',
          count: 5,
        },
        {
          featureFlagEnvironmentId: 'ffe2',
          featureFlagId: 'ff2',
          strategyId: null,
          variantId: null,
          type: 'EVALUATION',
          count: 3,
        },
      ] as any;

      await service.trackEvaluations('p1', evaluations);
      expect(metricsService.incrementBy).toHaveBeenCalledTimes(2);
      expect(metricsService.incrementBy).toHaveBeenCalledWith({
        projectId: 'p1',
        environmentId: 'ffe1',
        flagId: 'ff1',
        strategyId: 's1',
        variantId: 'v1',
        type: 'EVALUATION',
        count: 5,
      });
    });

    it('does nothing for empty evaluations array', async () => {
      await service.trackEvaluations('p1', []);
      expect(metricsService.incrementBy).not.toHaveBeenCalled();
    });
  });

  describe('invalidateSdkConfig', () => {
    it('deletes the cache key', async () => {
      await service.invalidateSdkConfig('e1');
      expect(redis.del).toHaveBeenCalledWith(`${SDK_CACHE_PREFIX}e1`);
    });

    it('swallows Redis errors', async () => {
      redis.del.mockRejectedValueOnce(new Error('boom'));
      await expect(service.invalidateSdkConfig('e1')).resolves.toBeUndefined();
    });
  });

  describe('invalidateSdkConfigByProject', () => {
    it('invalidates cache for every environment in project', async () => {
      prisma.environment.findMany.mockResolvedValueOnce([
        { id: 'e1' },
        { id: 'e2' },
      ]);
      await service.invalidateSdkConfigByProject('p1');
      expect(redis.del).toHaveBeenCalledWith(`${SDK_CACHE_PREFIX}e1`);
      expect(redis.del).toHaveBeenCalledWith(`${SDK_CACHE_PREFIX}e2`);
    });

    it('does nothing when project has no environments', async () => {
      prisma.environment.findMany.mockResolvedValueOnce([]);
      await service.invalidateSdkConfigByProject('p1');
      expect(redis.del).not.toHaveBeenCalled();
    });
  });

  describe('buildFlagsMap (via getConfig)', () => {
    it('filters archived strategyVariants and variants', async () => {
      prisma.environment.findFirst.mockResolvedValueOnce({
        id: 'e1',
        name: 'prod',
        version: 1,
      });
      redis.get.mockResolvedValueOnce(null);
      prisma.environment.findUnique.mockResolvedValueOnce({
        name: 'prod',
        version: 1,
        project: { id: 'p1', actions: [] },
        featureFlags: [
          {
            id: 'ffe1',
            featureFlag: { id: 'ff1', key: 'f', variants: [] },
            enabled: true,
            strategies: [
              {
                id: 's1',
                name: 'n',
                enabled: true,
                priority: 1,
                matchType: 'ALL',
                rolloutPercentage: null,
                rolloutStickinessField: null,
                timezone: null,
                startsAt: null,
                endsAt: null,
                segments: [],
                rules: [],
                strategyVariants: [
                  {
                    id: 'sv1',
                    weight: 100,
                    isArchived: false,
                    variant: {
                      id: 'v1',
                      name: 'on',
                      payload: 'x',
                      payloadType: 'STRING',
                      isArchived: false,
                    },
                  },
                  {
                    id: 'sv2',
                    weight: 0,
                    isArchived: true,
                    variant: {
                      id: 'v2',
                      name: 'off',
                      payload: 'y',
                      payloadType: 'STRING',
                      isArchived: false,
                    },
                  },
                ],
              },
            ],
          },
        ],
      });

      const result = await service.getConfig({ projectId: 'p1' }, 'prod');
      const sv = result.flags['f'].strategies[0].strategyVariants;
      expect(sv).toHaveLength(1);
      expect(sv[0].id).toBe('sv1');
    });
  });
});
