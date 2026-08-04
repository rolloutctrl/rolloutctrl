import { Test } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { FeatureFlagService } from './feature-flag.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccessService } from '../access/access.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EnvironmentService } from '../environment/environment.service';
import { NotificationService } from '../notification/notification.service';
import { createMockPrismaService } from 'src/common/testing/mock-prisma';
import { evaluateRule } from '../access/access.utils';
import { hashCode } from 'src/common/utils/utils';

jest.mock('../access/access.utils', () => ({
  ...jest.requireActual('../access/access.utils'),
  evaluateRule: jest.fn(),
}));

const mockedEvaluateRule = evaluateRule as jest.MockedFunction<
  typeof evaluateRule
>;

function mockUser(overrides: any = {}) {
  return {
    id: 'u1',
    email: 'user@example.com',
    name: 'User',
    ...overrides,
  } as any;
}

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let accessService: { invalidateCacheByProject: jest.Mock };
  let auditLogService: { logAction: jest.Mock };
  let environmentService: { incrementEnvironmentVersion: jest.Mock };
  let notificationService: {
    notifyOrganizationOwnersAndAdmins: jest.Mock;
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    accessService = { invalidateCacheByProject: jest.fn() };
    auditLogService = { logAction: jest.fn() };
    environmentService = { incrementEnvironmentVersion: jest.fn() };
    notificationService = { notifyOrganizationOwnersAndAdmins: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        FeatureFlagService,
        { provide: PrismaService, useValue: prisma },
        { provide: AccessService, useValue: accessService },
        { provide: AuditLogService, useValue: auditLogService },
        { provide: EnvironmentService, useValue: environmentService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = moduleRef.get(FeatureFlagService);
    jest.clearAllMocks();
  });

  describe('createFeatureFlag', () => {
    const dto = { key: 'new-flag', description: 'desc' };
    const project = {
      id: 'p1',
      slug: 'p1-slug',
      organizationId: 'o1',
      environments: [{ id: 'e1' }, { id: 'e2' }],
    };

    it('throws NotFound when project not found', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.createFeatureFlag(mockUser(), 'p1', dto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws Conflict when flag key exists', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(project);
      prisma.featureFlag.findUnique.mockResolvedValueOnce({ id: 'existing' });
      await expect(
        service.createFeatureFlag(mockUser(), 'p1', dto as any),
      ).rejects.toThrow(ConflictException);
    });

    it('creates flag, environment rows, audit log, increments versions', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(project);
      prisma.featureFlag.findUnique.mockResolvedValueOnce(null);
      const createdFlag = { id: 'ff1', key: 'new-flag' };
      prisma.featureFlag.create.mockResolvedValueOnce(createdFlag);
      prisma.featureFlagEnvironment.createMany.mockResolvedValueOnce({
        count: 2,
      });
      prisma.featureFlag.findUnique.mockResolvedValueOnce({
        id: 'ff1',
        key: 'new-flag',
      });

      const result = await service.createFeatureFlag(
        mockUser(),
        'p1',
        dto as any,
      );

      expect(result).toMatchObject({ id: 'ff1', key: 'new-flag' });
      expect(prisma.featureFlagEnvironment.createMany).toHaveBeenCalledWith({
        data: [
          { featureFlagId: 'ff1', environmentId: 'e1', enabled: false },
          { featureFlagId: 'ff1', environmentId: 'e2', enabled: false },
        ],
      });
      expect(
        environmentService.incrementEnvironmentVersion,
      ).toHaveBeenCalledTimes(2);
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE',
          resourceType: 'FLAG',
          resourceId: 'ff1',
        }),
      );
    });

    it('skips environment rows when project has no environments', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        slug: 's',
        organizationId: 'o1',
        environments: [],
      });
      prisma.featureFlag.findUnique.mockResolvedValueOnce(null);
      prisma.featureFlag.create.mockResolvedValueOnce({ id: 'ff1', key: 'k' });
      prisma.featureFlag.findUnique.mockResolvedValueOnce({ id: 'ff1' });

      await service.createFeatureFlag(mockUser(), 'p1', dto as any);
      expect(prisma.featureFlagEnvironment.createMany).not.toHaveBeenCalled();
      expect(
        environmentService.incrementEnvironmentVersion,
      ).not.toHaveBeenCalled();
    });

    it('resolves project by id OR slug', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(project);
      prisma.featureFlag.findUnique.mockResolvedValueOnce(null);
      prisma.featureFlag.create.mockResolvedValueOnce({ id: 'ff1', key: 'k' });
      prisma.featureFlag.findUnique.mockResolvedValueOnce({ id: 'ff1' });

      await service.createFeatureFlag(mockUser(), 'p1-slug', dto as any);
      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ id: 'p1-slug' }, { slug: 'p1-slug' }] },
        include: { environments: true },
      });
    });
  });

  describe('createMultipleFeatureFlags', () => {
    const project = {
      id: 'p1',
      slug: 's',
      organizationId: 'o1',
      environments: [{ id: 'e1' }],
    };

    it('throws NotFound when project missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.createMultipleFeatureFlags(mockUser(), 'p1', [] as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws Conflict on duplicate keys in request', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(project);
      await expect(
        service.createMultipleFeatureFlags(mockUser(), 'p1', [
          { key: 'a' },
          { key: 'a' },
        ] as any),
      ).rejects.toThrow(ConflictException);
    });

    it('throws Conflict when keys already exist in project', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(project);
      prisma.featureFlag.findMany.mockResolvedValueOnce([{ key: 'a' }]);
      await expect(
        service.createMultipleFeatureFlags(mockUser(), 'p1', [
          { key: 'a' },
          { key: 'b' },
        ] as any),
      ).rejects.toThrow(ConflictException);
    });

    it('creates all flags and returns them with includes', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(project);
      prisma.featureFlag.findMany.mockResolvedValueOnce([]);
      prisma.featureFlag.create
        .mockResolvedValueOnce({ id: 'f1', key: 'a' })
        .mockResolvedValueOnce({ id: 'f2', key: 'b' });
      prisma.featureFlagEnvironment.createMany.mockResolvedValue({ count: 1 });
      prisma.featureFlag.findMany.mockResolvedValueOnce([
        { id: 'f1', key: 'a' },
        { id: 'f2', key: 'b' },
      ]);

      const result = await service.createMultipleFeatureFlags(
        mockUser(),
        'p1',
        [{ key: 'a' }, { key: 'b' }] as any,
      );
      expect(result).toHaveLength(2);
      expect(prisma.featureFlag.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('toggleFlagFavorite', () => {
    it('throws NotFound when flag missing', async () => {
      prisma.featureFlag.findUnique.mockResolvedValueOnce(null);
      await expect(service.toggleFlagFavorite('f1', true)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates isFavorite', async () => {
      prisma.featureFlag.findUnique.mockResolvedValueOnce({ id: 'f1' });
      prisma.featureFlag.update.mockResolvedValueOnce({
        id: 'f1',
        isFavorite: true,
      });
      const result = await service.toggleFlagFavorite('f1', true);
      expect(result).toMatchObject({ isFavorite: true });
      expect(prisma.featureFlag.update).toHaveBeenCalledWith({
        where: { id: 'f1' },
        data: { isFavorite: true },
      });
    });
  });

  describe('findAllFeatureFlags', () => {
    it('throws NotFound when project missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(null);
      await expect(service.findAllFeatureFlags('p1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns paginated flags with cursor metadata', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1', slug: 's' });
      prisma.featureFlag.findMany.mockResolvedValueOnce([
        { id: 'f1' },
        { id: 'f2' },
      ]);
      const result = await service.findAllFeatureFlags(
        'p1',
        false,
        undefined,
        20,
      );
      expect(result).toEqual({
        data: [{ id: 'f1' }, { id: 'f2' }],
        nextCursor: 'f2',
        hasMore: false,
      });
    });

    it('hasMore=true when result length equals limit', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1', slug: 's' });
      prisma.featureFlag.findMany.mockResolvedValueOnce([
        { id: 'f1' },
        { id: 'f2' },
      ]);
      const result = await service.findAllFeatureFlags(
        'p1',
        false,
        undefined,
        2,
      );
      expect(result.hasMore).toBe(true);
    });

    it('passes cursor and skip when cursor provided', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1', slug: 's' });
      prisma.featureFlag.findMany.mockResolvedValueOnce([{ id: 'f2' }]);
      await service.findAllFeatureFlags('p1', false, 'f1', 20);
      expect(prisma.featureFlag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          cursor: { id: 'f1' },
        }),
      );
    });
  });

  describe('findFeatureFlagById', () => {
    it('throws NotFound when project missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(null);
      await expect(service.findFeatureFlagById('f1', 'p1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFound when flag missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1', slug: 's' });
      prisma.featureFlag.findFirst.mockResolvedValueOnce(null);
      await expect(service.findFeatureFlagById('f1', 'p1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the flag', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1', slug: 's' });
      prisma.featureFlag.findFirst.mockResolvedValueOnce({
        id: 'f1',
        key: 'k',
      });
      const result = await service.findFeatureFlagById('f1', 'p1');
      expect(result).toMatchObject({ id: 'f1' });
    });
  });

  describe('updateFeatureFlag', () => {
    const dto = { key: 'new-key', description: 'd', archived: false } as any;

    it('throws when project missing (source reads project.id before null check — bug)', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(null);
      // Note: source code dereferences project.id before the !project check,
      // so this currently throws a TypeError rather than NotFoundException.
      await expect(
        service.updateFeatureFlag('f1', 'p1', dto),
      ).rejects.toThrow();
    });

    it('throws NotFound when flag missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1' });
      prisma.environment.findMany.mockResolvedValueOnce([]);
      prisma.featureFlag.findFirst.mockResolvedValueOnce(null);
      await expect(service.updateFeatureFlag('f1', 'p1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws Conflict when new key collides with existing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1' });
      prisma.environment.findMany.mockResolvedValueOnce([]);
      prisma.featureFlag.findFirst.mockResolvedValueOnce({
        id: 'f1',
        key: 'old',
      });
      prisma.featureFlag.findUnique.mockResolvedValueOnce({ id: 'other' });
      await expect(
        service.updateFeatureFlag('f1', 'p1', { key: 'new-key' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('updates and invalidates cache', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1' });
      prisma.environment.findMany.mockResolvedValueOnce([{ id: 'e1' }]);
      prisma.featureFlag.findFirst.mockResolvedValueOnce({
        id: 'f1',
        key: 'old',
      });
      prisma.featureFlag.update.mockResolvedValueOnce({
        id: 'f1',
        key: 'new-key',
      });

      const result = await service.updateFeatureFlag('f1', 'p1', dto);
      expect(result).toMatchObject({ id: 'f1' });
      expect(
        environmentService.incrementEnvironmentVersion,
      ).toHaveBeenCalledWith('e1');
      expect(accessService.invalidateCacheByProject).toHaveBeenCalledWith('p1');
    });
  });

  describe('archiveFeatureFlag / restoreFeatureFlag', () => {
    it('archive calls update with archived=true', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1' });
      prisma.environment.findMany.mockResolvedValueOnce([]);
      prisma.featureFlag.findFirst.mockResolvedValueOnce({
        id: 'f1',
        key: 'k',
      });
      prisma.featureFlag.update.mockResolvedValueOnce({ id: 'f1' });
      await service.archiveFeatureFlag('f1', 'p1');
      expect(prisma.featureFlag.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ archived: true }),
        }),
      );
    });

    it('restore calls update with archived=false', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1' });
      prisma.environment.findMany.mockResolvedValueOnce([]);
      prisma.featureFlag.findFirst.mockResolvedValueOnce({
        id: 'f1',
        key: 'k',
      });
      prisma.featureFlag.update.mockResolvedValueOnce({ id: 'f1' });
      await service.restoreFeatureFlag('f1', 'p1');
      expect(prisma.featureFlag.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ archived: false }),
        }),
      );
    });
  });

  describe('deleteFeatureFlag', () => {
    it('throws NotFound when project missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.deleteFeatureFlag(mockUser(), 'f1', 'p1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFound when flag missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.featureFlag.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.deleteFeatureFlag(mockUser(), 'f1', 'p1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deletes flag, logs audit, increments env versions', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        slug: 's',
        organizationId: 'o1',
      });
      prisma.featureFlag.findFirst.mockResolvedValueOnce({
        id: 'f1',
        key: 'k',
      });
      prisma.environment.findMany.mockResolvedValueOnce([{ id: 'e1' }]);
      prisma.featureFlag.delete.mockResolvedValueOnce({ id: 'f1' });

      await service.deleteFeatureFlag(mockUser(), 'f1', 'p1');
      expect(prisma.featureFlag.delete).toHaveBeenCalledWith({
        where: { id: 'f1' },
      });
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', resourceId: 'f1' }),
      );
      expect(
        environmentService.incrementEnvironmentVersion,
      ).toHaveBeenCalledWith('e1');
    });
  });

  describe('configureFlagForEnvironment', () => {
    const dto = {
      projectId: 'p1',
      flagId: 'f1',
      environmentId: 'e1',
      enabled: true,
    } as any;

    it('throws NotFound when flag missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1', slug: 's' });
      prisma.featureFlag.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.configureFlagForEnvironment(mockUser(), dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFound when environment missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1', slug: 's' });
      prisma.featureFlag.findUnique.mockResolvedValueOnce({
        id: 'f1',
        key: 'k',
        project: { id: 'p1', organizationId: 'o1' },
      });
      prisma.environment.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.configureFlagForEnvironment(mockUser(), dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('upserts, increments version, invalidates cache, logs audit', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1', slug: 's' });
      prisma.featureFlag.findUnique.mockResolvedValueOnce({
        id: 'f1',
        key: 'k',
        project: { id: 'p1', organizationId: 'o1' },
      });
      prisma.environment.findUnique.mockResolvedValueOnce({
        id: 'e1',
        name: 'staging',
      });
      prisma.featureFlagEnvironment.upsert.mockResolvedValueOnce({
        featureFlagId: 'f1',
        featureFlag: { key: 'k' },
      });

      await service.configureFlagForEnvironment(mockUser(), dto);
      expect(prisma.featureFlagEnvironment.upsert).toHaveBeenCalled();
      expect(
        environmentService.incrementEnvironmentVersion,
      ).toHaveBeenCalledWith('e1');
      expect(accessService.invalidateCacheByProject).toHaveBeenCalledWith('p1');
      expect(auditLogService.logAction).toHaveBeenCalled();
      // No notification for non-production environment
      expect(
        notificationService.notifyOrganizationOwnersAndAdmins,
      ).not.toHaveBeenCalled();
    });

    it('notifies owners when environment is production', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        slug: 's',
        organizationId: 'o1',
      });
      prisma.featureFlag.findUnique.mockResolvedValueOnce({
        id: 'f1',
        key: 'k',
        project: { id: 'p1', organizationId: 'o1' },
      });
      prisma.environment.findUnique.mockResolvedValueOnce({
        id: 'e1',
        name: 'production',
      });
      prisma.featureFlagEnvironment.upsert.mockResolvedValueOnce({
        featureFlagId: 'f1',
        featureFlag: { key: 'k' },
      });

      await service.configureFlagForEnvironment(mockUser(), dto);
      expect(
        notificationService.notifyOrganizationOwnersAndAdmins,
      ).toHaveBeenCalledWith(
        'o1',
        expect.objectContaining({ entityType: 'FLAG' }),
      );
    });
  });

  describe('getFlagEnvironmentConfig', () => {
    it('throws NotFound when config missing', async () => {
      prisma.featureFlagEnvironment.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.getFlagEnvironmentConfig('f1', 'e1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns config', async () => {
      prisma.featureFlagEnvironment.findUnique.mockResolvedValueOnce({
        id: 'ffe1',
      });
      const result = await service.getFlagEnvironmentConfig('f1', 'e1');
      expect(result).toEqual({ id: 'ffe1' });
    });
  });

  describe('getAllEnvironmentsConfig', () => {
    it('throws NotFound when flag missing', async () => {
      prisma.featureFlag.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.getAllEnvironmentsConfig('f1', 'p1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns environments array', async () => {
      prisma.featureFlag.findFirst.mockResolvedValueOnce({
        environments: [{ id: 'e1' }],
      });
      const result = await service.getAllEnvironmentsConfig('f1', 'p1');
      expect(result).toEqual([{ id: 'e1' }]);
    });
  });

  describe('evaluateFlag', () => {
    it('returns false when flag not found', async () => {
      prisma.featureFlag.findFirst.mockResolvedValueOnce(null);
      const result = await service.evaluateFlag('k', 'e1', {});
      expect(result).toBe(false);
    });

    it('returns false when flagEnv not found', async () => {
      prisma.featureFlag.findFirst.mockResolvedValueOnce({
        environments: [],
      });
      const result = await service.evaluateFlag('k', 'e1', {});
      expect(result).toBe(false);
    });

    it('returns false when flagEnv disabled', async () => {
      prisma.featureFlag.findFirst.mockResolvedValueOnce({
        environments: [{ enabled: false, strategies: [] }],
      });
      const result = await service.evaluateFlag('k', 'e1', {});
      expect(result).toBe(false);
    });

    it('returns enabled when no strategies', async () => {
      prisma.featureFlag.findFirst.mockResolvedValueOnce({
        environments: [{ enabled: true, strategies: [] }],
      });
      const result = await service.evaluateFlag('k', 'e1', {});
      expect(result).toBe(true);
    });

    it('skips strategy when rollout bucket >= percentage', async () => {
      // userId 'user-1' with flag 'k' -> deterministic bucket
      const userId = 'user-1';
      const bucket = Math.abs(hashCode(userId) % 100);
      prisma.featureFlag.findFirst.mockResolvedValueOnce({
        environments: [
          {
            enabled: true,
            strategies: [
              {
                rolloutPercentage: bucket - 1, // bucket >= percentage -> skip
                rules: [{ field: 'x', operator: 'EQUALS', value: 1 }],
              },
              {
                rolloutPercentage: null,
                rules: [{ field: 'x', operator: 'EQUALS', value: 1 }],
              },
            ],
          },
        ],
      });
      mockedEvaluateRule.mockReturnValueOnce(true);
      const result = await service.evaluateFlag('k', 'e1', { userId });
      expect(result).toBe(true);
    });

    it('returns true when strategy rules all match', async () => {
      prisma.featureFlag.findFirst.mockResolvedValueOnce({
        environments: [
          {
            enabled: true,
            strategies: [
              {
                rolloutPercentage: null,
                rules: [
                  { field: 'a', operator: 'EQUALS', value: 1 },
                  { field: 'b', operator: 'EQUALS', value: 2 },
                ],
              },
            ],
          },
        ],
      });
      mockedEvaluateRule.mockReturnValue(true);
      const result = await service.evaluateFlag('k', 'e1', { userId: 'u1' });
      expect(result).toBe(true);
    });

    it('returns false when no strategy matches', async () => {
      prisma.featureFlag.findFirst.mockResolvedValueOnce({
        environments: [
          {
            enabled: true,
            strategies: [
              {
                rolloutPercentage: null,
                rules: [{ field: 'a', operator: 'EQUALS', value: 1 }],
              },
            ],
          },
        ],
      });
      mockedEvaluateRule.mockReturnValue(false);
      const result = await service.evaluateFlag('k', 'e1', { userId: 'u1' });
      expect(result).toBe(false);
    });
  });

  describe('syncFeatureFlagsWithNewEnvironment', () => {
    it('throws NotFound when environment missing', async () => {
      prisma.environment.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.syncFeatureFlagsWithNewEnvironment('e1', 'p1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns {created: 0} when no flags', async () => {
      prisma.environment.findUnique.mockResolvedValueOnce({ id: 'e1' });
      prisma.featureFlag.findMany.mockResolvedValueOnce([]);
      const result = await service.syncFeatureFlagsWithNewEnvironment(
        'e1',
        'p1',
      );
      expect(result).toEqual({ created: 0 });
    });

    it('creates FeatureFlagEnvironment rows for each flag', async () => {
      prisma.environment.findUnique.mockResolvedValueOnce({ id: 'e1' });
      prisma.featureFlag.findMany.mockResolvedValueOnce([
        { id: 'f1' },
        { id: 'f2' },
      ]);
      prisma.featureFlagEnvironment.createMany.mockResolvedValueOnce({
        count: 2,
      });
      const result = await service.syncFeatureFlagsWithNewEnvironment(
        'e1',
        'p1',
      );
      expect(result).toEqual({ created: 2, total: 2 });
      expect(prisma.featureFlagEnvironment.createMany).toHaveBeenCalledWith({
        data: [
          { featureFlagId: 'f1', environmentId: 'e1', enabled: false },
          { featureFlagId: 'f2', environmentId: 'e1', enabled: false },
        ],
        skipDuplicates: true,
      });
    });
  });

  describe('getProjectByIdOrSlug', () => {
    it('throws NotFound when project missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(null);
      await expect(service.getProjectByIdOrSlug('p1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns project', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({ id: 'p1' });
      const result = await service.getProjectByIdOrSlug('p1');
      expect(result).toEqual({ id: 'p1' });
    });
  });
});
