import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { StrategyService } from './strategy.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccessService } from '../access/access.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EnvironmentService } from '../environment/environment.service';
import { createMockPrismaService } from 'src/common/testing/mock-prisma';
import { Operator } from 'src/common/generated/prisma/enums';

function mockUser(overrides: any = {}) {
  return { id: 'u1', email: 'u@e.com', name: 'U', ...overrides } as any;
}

describe('StrategyService', () => {
  let service: StrategyService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let accessService: { invalidateCacheByProject: jest.Mock };
  let auditLogService: { logAction: jest.Mock };
  let environmentService: { incrementEnvironmentVersion: jest.Mock };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    accessService = { invalidateCacheByProject: jest.fn() };
    auditLogService = { logAction: jest.fn() };
    environmentService = { incrementEnvironmentVersion: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        StrategyService,
        { provide: PrismaService, useValue: prisma },
        { provide: AccessService, useValue: accessService },
        { provide: AuditLogService, useValue: auditLogService },
        { provide: EnvironmentService, useValue: environmentService },
      ],
    }).compile();

    service = moduleRef.get(StrategyService);
    jest.clearAllMocks();
  });

  describe('createStrategy', () => {
    const baseDto = {
      projectId: 'p1',
      featureFlagEnvironmentIds: ['ffe1'],
      name: 'strat',
    } as any;

    function seedProject() {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
    }

    function seedEnvironments() {
      prisma.featureFlagEnvironment.findMany.mockResolvedValueOnce([
        {
          id: 'ffe1',
          environment: { id: 'e1', name: 'prod' },
        },
      ]);
    }

    it('throws NotFound when project missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(null);
      await expect(service.createStrategy(mockUser(), baseDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFound when one or more FFE not found', async () => {
      seedProject();
      prisma.featureFlagEnvironment.findMany.mockResolvedValueOnce([]);
      await expect(
        service.createStrategy(mockUser(), {
          ...baseDto,
          featureFlagEnvironmentIds: ['ffe1', 'ffe2'],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest when rolloutPercentage set without stickinessField', async () => {
      seedProject();
      seedEnvironments();
      await expect(
        service.createStrategy(mockUser(), {
          ...baseDto,
          rolloutPercentage: 50,
          rolloutStickinessField: null,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when startsAt set without timezone', async () => {
      seedProject();
      seedEnvironments();
      await expect(
        service.createStrategy(mockUser(), {
          ...baseDto,
          startsAt: new Date().toISOString(),
          timezone: null,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when endsAt set without timezone', async () => {
      seedProject();
      seedEnvironments();
      await expect(
        service.createStrategy(mockUser(), {
          ...baseDto,
          endsAt: new Date().toISOString(),
          timezone: null,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when timezone invalid', async () => {
      seedProject();
      seedEnvironments();
      await expect(
        service.createStrategy(mockUser(), {
          ...baseDto,
          timezone: 'Invalid/Zone',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when default strategy already exists', async () => {
      seedProject();
      seedEnvironments();
      prisma.strategy.findMany.mockResolvedValueOnce([
        { id: 'existing-default', featureFlagEnvironmentId: 'ffe1' },
      ]);
      await expect(
        service.createStrategy(mockUser(), { ...baseDto, isDefault: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFound when one or more segments not found', async () => {
      seedProject();
      seedEnvironments();
      prisma.segment.findMany.mockResolvedValueOnce([]);
      await expect(
        service.createStrategy(mockUser(), {
          ...baseDto,
          segmentIds: ['seg-missing'],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates strategy with computed priority = maxPriority + 1', async () => {
      seedProject();
      seedEnvironments();
      prisma.strategy.aggregate.mockResolvedValueOnce({
        _max: { priority: 5 },
      });
      prisma.strategy.create.mockResolvedValueOnce({
        id: 's1',
        name: 'strat',
        featureFlagEnvironment: { environment: { id: 'e1', name: 'prod' } },
      });

      const result = await service.createStrategy(mockUser(), baseDto);
      expect(result).toHaveLength(1);
      expect(prisma.strategy.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ priority: 6 }),
        }),
      );
      expect(
        environmentService.incrementEnvironmentVersion,
      ).toHaveBeenCalledWith('e1');
      expect(accessService.invalidateCacheByProject).toHaveBeenCalledWith('p1');
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE', resourceType: 'STRATEGY' }),
      );
    });

    it('creates default strategy with priority 0 and re-assigns existing priorities', async () => {
      seedProject();
      seedEnvironments();
      // First findMany: existing-defaults check -> none
      prisma.strategy.findMany.mockResolvedValueOnce([]);
      // Second findMany (inside transaction): existing strategies for priority re-assignment
      prisma.strategy.findMany.mockResolvedValueOnce([
        { id: 's-old-1' },
        { id: 's-old-2' },
      ]);
      prisma.strategy.aggregate.mockResolvedValueOnce({
        _max: { priority: null },
      });
      prisma.strategy.update.mockResolvedValue({ id: 'updated' });
      prisma.strategy.create.mockResolvedValueOnce({
        id: 's-default',
        name: 'default',
        featureFlagEnvironment: { environment: { id: 'e1', name: 'prod' } },
      });

      await service.createStrategy(mockUser(), { ...baseDto, isDefault: true });
      // Re-assigns priorities 1, 2 to existing strategies
      expect(prisma.strategy.update).toHaveBeenCalledTimes(2);
      expect(prisma.strategy.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ priority: 0, isDefault: true }),
        }),
      );
    });

    it('connects segments when segmentIds provided', async () => {
      seedProject();
      seedEnvironments();
      prisma.segment.findMany.mockResolvedValueOnce([{ id: 'seg1' }]);
      prisma.strategy.aggregate.mockResolvedValueOnce({
        _max: { priority: null },
      });
      prisma.strategy.create.mockResolvedValueOnce({
        id: 's1',
        name: 'n',
        featureFlagEnvironment: { environment: { id: 'e1', name: 'prod' } },
      });

      await service.createStrategy(mockUser(), {
        ...baseDto,
        segmentIds: ['seg1'],
      });
      expect(prisma.strategy.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            segments: { connect: [{ id: 'seg1' }] },
          }),
        }),
      );
    });
  });

  describe('findAllStrategies', () => {
    it('returns strategies ordered by priority desc', async () => {
      prisma.strategy.findMany.mockResolvedValueOnce([
        { id: 's1', priority: 2 },
        { id: 's2', priority: 1 },
      ]);
      const result = await service.findAllStrategies('ffe1');
      expect(result).toHaveLength(2);
      expect(prisma.strategy.findMany).toHaveBeenCalledWith({
        where: { featureFlagEnvironmentId: 'ffe1' },
        orderBy: { priority: 'desc' },
        include: { segments: true, rules: true },
      });
    });
  });

  describe('findStrategyById', () => {
    it('throws NotFound when strategy missing', async () => {
      prisma.strategy.findUnique.mockResolvedValueOnce(null);
      await expect(service.findStrategyById('s1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns strategy with includes', async () => {
      prisma.strategy.findUnique.mockResolvedValueOnce({ id: 's1' });
      const result = await service.findStrategyById('s1');
      expect(result).toEqual({ id: 's1' });
    });
  });

  describe('deleteStrategy', () => {
    it('throws NotFound when strategy missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.deleteStrategy(mockUser(), 's1', 'p1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deletes, increments version, invalidates cache, logs audit', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findFirst.mockResolvedValueOnce({
        id: 's1',
        name: 'n',
        featureFlagEnvironment: {
          environmentId: 'e1',
          environment: {
            id: 'e1',
            name: 'prod',
            project: { organizationId: 'o1' },
          },
          featureFlag: { id: 'f1', key: 'k' },
        },
      });
      prisma.strategy.delete.mockResolvedValueOnce({ id: 's1' });

      await service.deleteStrategy(mockUser(), 's1', 'p1');
      expect(prisma.strategy.delete).toHaveBeenCalledWith({
        where: { id: 's1' },
      });
      expect(
        environmentService.incrementEnvironmentVersion,
      ).toHaveBeenCalledWith('e1');
      expect(accessService.invalidateCacheByProject).toHaveBeenCalledWith('p1');
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', resourceId: 's1' }),
      );
    });
  });

  describe('reorderStrategies', () => {
    it('updates priorities in a transaction and returns sorted list', async () => {
      prisma.strategy.findMany.mockResolvedValueOnce([
        { id: 's1', priority: 2 },
        { id: 's2', priority: 1 },
      ]);
      const result = await service.reorderStrategies('ffe1', {
        rules: [{ id: 's1' }, { id: 's2' }],
      } as any);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.strategy.update).toHaveBeenCalledTimes(2);
      expect(prisma.strategy.update).toHaveBeenNthCalledWith(1, {
        where: { id: 's1' },
        data: { priority: 2 },
      });
      expect(prisma.strategy.update).toHaveBeenNthCalledWith(2, {
        where: { id: 's2' },
        data: { priority: 1 },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('createStrategyRule', () => {
    it('throws NotFound when strategy missing', async () => {
      prisma.strategy.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.createStrategyRule({
          strategyId: 's1',
          field: 'x',
          operator: Operator.EQUALS,
          value: 1,
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest when field empty', async () => {
      prisma.strategy.findUnique.mockResolvedValueOnce({ id: 's1' });
      await expect(
        service.createStrategyRule({
          strategyId: 's1',
          field: '  ',
          operator: Operator.EQUALS,
          value: 1,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest for unsupported operator', async () => {
      prisma.strategy.findUnique.mockResolvedValueOnce({ id: 's1' });
      await expect(
        service.createStrategyRule({
          strategyId: 's1',
          field: 'x',
          operator: 'NOPE' as any,
          value: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when IN value is not an array', async () => {
      prisma.strategy.findUnique.mockResolvedValueOnce({ id: 's1' });
      await expect(
        service.createStrategyRule({
          strategyId: 's1',
          field: 'x',
          operator: Operator.IN,
          value: 123,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates rule on valid input', async () => {
      prisma.strategy.findUnique.mockResolvedValueOnce({ id: 's1' });
      prisma.strategyRule.create.mockResolvedValueOnce({ id: 'r1' });
      const result = await service.createStrategyRule({
        strategyId: 's1',
        field: 'country',
        operator: Operator.EQUALS,
        value: 'US',
      } as any);
      expect(result).toEqual({ id: 'r1' });
      expect(prisma.strategyRule.create).toHaveBeenCalledWith({
        data: {
          strategyId: 's1',
          field: 'country',
          operator: Operator.EQUALS,
          value: 'US',
        },
      });
    });
  });

  describe('updateStrategyRule', () => {
    it('throws NotFound when rule missing', async () => {
      prisma.strategyRule.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.updateStrategyRule('r1', { field: 'x' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('skips validation when no field/operator/value provided', async () => {
      prisma.strategyRule.findUnique.mockResolvedValueOnce({ id: 'r1' });
      prisma.strategyRule.update.mockResolvedValueOnce({ id: 'r1' });
      const result = await service.updateStrategyRule('r1', {} as any);
      expect(result).toEqual({ id: 'r1' });
    });

    it('updates rule with validation', async () => {
      prisma.strategyRule.findUnique.mockResolvedValueOnce({ id: 'r1' });
      prisma.strategyRule.update.mockResolvedValueOnce({ id: 'r1' });
      const result = await service.updateStrategyRule('r1', {
        field: 'country',
        operator: Operator.EQUALS,
        value: 'RU',
      } as any);
      expect(result).toEqual({ id: 'r1' });
    });
  });

  describe('deleteStrategyRule', () => {
    it('throws NotFound when rule missing', async () => {
      prisma.strategyRule.findFirst.mockResolvedValueOnce(null);
      await expect(service.deleteStrategyRule('r1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes rule', async () => {
      prisma.strategyRule.findFirst.mockResolvedValueOnce({ id: 'r1' });
      await service.deleteStrategyRule('r1');
      expect(prisma.strategyRule.delete).toHaveBeenCalledWith({
        where: { id: 'r1' },
      });
    });
  });

  describe('findAllStrategyRules', () => {
    it('returns rules for strategy', async () => {
      prisma.strategyRule.findMany.mockResolvedValueOnce([{ id: 'r1' }]);
      const result = await service.findAllStrategyRules('s1');
      expect(result).toEqual([{ id: 'r1' }]);
    });
  });

  describe('toggleStrategyEnable', () => {
    it('throws NotFound when strategy missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.toggleStrategyEnable('s1', mockUser(), true, 'p1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('toggles enabled and logs audit with changes', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findUnique.mockResolvedValueOnce({
        id: 's1',
        name: 'n',
        featureFlagEnvironment: {
          environmentId: 'e1',
          environment: {
            id: 'e1',
            name: 'prod',
            project: { organizationId: 'o1' },
          },
        },
      });
      prisma.strategy.update.mockResolvedValueOnce({ id: 's1', enabled: true });

      await service.toggleStrategyEnable('s1', mockUser(), true, 'p1');
      expect(prisma.strategy.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { enabled: true },
      });
      expect(
        environmentService.incrementEnvironmentVersion,
      ).toHaveBeenCalledWith('e1');
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ENABLE' }),
      );
    });

    it('logs DISABLE action when enabled=false', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findUnique.mockResolvedValueOnce({
        id: 's1',
        name: 'n',
        featureFlagEnvironment: {
          environmentId: 'e1',
          environment: {
            id: 'e1',
            name: 'prod',
            project: { organizationId: 'o1' },
          },
        },
      });
      prisma.strategy.update.mockResolvedValueOnce({
        id: 's1',
        enabled: false,
      });

      await service.toggleStrategyEnable('s1', mockUser(), false, 'p1');
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DISABLE' }),
      );
    });
  });

  describe('findAllStrategyVariants', () => {
    it('throws NotFound when strategy missing', async () => {
      prisma.strategy.findUnique.mockResolvedValueOnce(null);
      await expect(service.findAllStrategyVariants('s1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns strategy variants', async () => {
      prisma.strategy.findUnique.mockResolvedValueOnce({ id: 's1' });
      prisma.strategyVariant.findMany.mockResolvedValueOnce([
        { id: 'sv1', variant: { id: 'v1' } },
      ]);
      const result = await service.findAllStrategyVariants('s1');
      expect(result).toHaveLength(1);
    });
  });

  describe('updateStrategy', () => {
    function seedStrategy(overrides: any = {}) {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findUnique.mockResolvedValueOnce({
        id: 's1',
        name: 'old',
        isDefault: false,
        priority: 1,
        rolloutPercentage: null,
        rolloutStickinessField: null,
        startsAt: null,
        endsAt: null,
        segments: [{ id: 'seg1' }],
        rules: [],
        strategyVariants: [],
        featureFlagEnvironmentId: 'ffe1',
        featureFlagEnvironment: {
          environment: { id: 'e1', name: 'prod' },
        },
        ...overrides,
      });
      // updateStrategy always calls findMany for updatedEnvironments
      prisma.featureFlagEnvironment.findMany.mockResolvedValueOnce([
        { id: 'ffe1', environment: { id: 'e1' } },
      ]);
    }

    it('throws NotFound when strategy missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.updateStrategy(mockUser(), 's1', { projectId: 'p1' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest when featureFlagEnvironmentIds is empty array', async () => {
      seedStrategy();
      await expect(
        service.updateStrategy(mockUser(), 's1', {
          projectId: 'p1',
          featureFlagEnvironmentIds: [],
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when rolloutPercentage set without stickinessField', async () => {
      seedStrategy();
      await expect(
        service.updateStrategy(mockUser(), 's1', {
          projectId: 'p1',
          rolloutPercentage: 50,
          rolloutStickinessField: null,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when startsAt set without timezone', async () => {
      seedStrategy();
      await expect(
        service.updateStrategy(mockUser(), 's1', {
          projectId: 'p1',
          startsAt: new Date().toISOString(),
          timezone: null,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when invalid timezone', async () => {
      seedStrategy();
      await expect(
        service.updateStrategy(mockUser(), 's1', {
          projectId: 'p1',
          timezone: 'Invalid/Zone',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when default strategy already exists in target env', async () => {
      seedStrategy();
      prisma.strategy.findFirst.mockResolvedValueOnce({
        id: 'other-default',
        featureFlagEnvironmentId: 'ffe1',
      });
      await expect(
        service.updateStrategy(mockUser(), 's1', {
          projectId: 'p1',
          isDefault: true,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('updates strategy name and logs audit with changes', async () => {
      seedStrategy({ name: 'old-name' });
      prisma.strategy.update.mockResolvedValueOnce({
        id: 's1',
        name: 'new-name',
      });

      const result = await service.updateStrategy(mockUser(), 's1', {
        projectId: 'p1',
        name: 'new-name',
      } as any);
      expect(result).toMatchObject({ id: 's1', name: 'new-name' });
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          metadata: expect.objectContaining({
            changes: expect.arrayContaining([
              expect.objectContaining({ field: 'name', after: 'new-name' }),
            ]),
          }),
        }),
      );
    });

    it('updates segmentIds and logs change', async () => {
      seedStrategy({ segments: [{ id: 'seg-old' }] });
      prisma.segment.findMany.mockResolvedValueOnce([{ id: 'seg-new' }]);
      prisma.strategy.update.mockResolvedValueOnce({ id: 's1' });

      await service.updateStrategy(mockUser(), 's1', {
        projectId: 'p1',
        segmentIds: ['seg-new'],
      } as any);
      expect(prisma.strategy.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            segments: { set: [{ id: 'seg-new' }] },
          }),
        }),
      );
    });

    it('replaces rules when dto.rules provided', async () => {
      seedStrategy({
        rules: [{ field: 'old', operator: 'EQUALS', value: 1, not: false }],
      });
      prisma.strategy.update.mockResolvedValueOnce({ id: 's1' });

      await service.updateStrategy(mockUser(), 's1', {
        projectId: 'p1',
        rules: [{ field: 'new', operator: 'EQUALS', value: 2 }],
      } as any);
      expect(prisma.strategyRule.deleteMany).toHaveBeenCalledWith({
        where: { strategyId: 's1' },
      });
      expect(prisma.strategy.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            rules: {
              create: [
                { field: 'new', operator: 'EQUALS', value: 2, not: undefined },
              ],
            },
          }),
        }),
      );
    });

    it('creates copies in additional environments', async () => {
      // Don't use seedStrategy — we need custom findMany ordering
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findUnique.mockResolvedValueOnce({
        id: 's1',
        name: 'strat',
        isDefault: false,
        priority: 1,
        rolloutPercentage: null,
        rolloutStickinessField: null,
        startsAt: null,
        endsAt: null,
        segments: [{ id: 'seg1' }],
        rules: [{ field: 'f', operator: 'EQUALS', value: 1, not: false }],
        strategyVariants: [
          {
            variantId: 'v1',
            weight: 100,
            isCustomWeight: false,
            isArchived: false,
          },
        ],
        matchType: 'ALL',
        enabled: true,
        featureFlagEnvironmentId: 'ffe1',
        featureFlagEnvironment: {
          environment: { id: 'e1', name: 'prod' },
        },
      });
      // Validation findMany (before transaction) — 2 environments
      prisma.featureFlagEnvironment.findMany.mockResolvedValueOnce([
        { id: 'ffe1', environment: { id: 'e1' } },
        { id: 'ffe2', environment: { id: 'e2' } },
      ]);
      // Inner transaction findMany — same 2 environments
      prisma.featureFlagEnvironment.findMany.mockResolvedValueOnce([
        { id: 'ffe1', environment: { id: 'e1' } },
        { id: 'ffe2', environment: { id: 'e2' } },
      ]);
      prisma.strategy.aggregate.mockResolvedValueOnce({
        _max: { priority: 3 },
      });
      prisma.strategy.update.mockResolvedValueOnce({ id: 's1' });
      prisma.strategy.create.mockResolvedValueOnce({ id: 's-copy' });

      await service.updateStrategy(mockUser(), 's1', {
        projectId: 'p1',
        featureFlagEnvironmentIds: ['ffe1', 'ffe2'],
      } as any);
      // Copy created for ffe2 (the non-current env)
      expect(prisma.strategy.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ featureFlagEnvironmentId: 'ffe2' }),
        }),
      );
    });
  });

  describe('addVariantToStrategy', () => {
    function seedStrategy() {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findUnique.mockResolvedValueOnce({
        id: 's1',
        name: 'strat',
        featureFlagEnvironment: {
          featureFlagId: 'ff1',
          environmentId: 'e1',
          environment: { id: 'e1', name: 'prod' },
          featureFlag: { id: 'ff1' },
        },
      });
    }

    it('throws NotFound when strategy missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.addVariantToStrategy(mockUser(), 's1', 'p1', {} as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest when neither variantId nor name provided', async () => {
      seedStrategy();
      await expect(
        service.addVariantToStrategy(mockUser(), 's1', 'p1', {} as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFound when variantId not found', async () => {
      seedStrategy();
      prisma.variant.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.addVariantToStrategy(mockUser(), 's1', 'p1', {
          variantId: 'v-missing',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest when variant belongs to different feature flag', async () => {
      seedStrategy();
      prisma.variant.findUnique.mockResolvedValueOnce({
        id: 'v1',
        featureFlagId: 'other-ff',
      });
      await expect(
        service.addVariantToStrategy(mockUser(), 's1', 'p1', {
          variantId: 'v1',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when variant name already exists', async () => {
      seedStrategy();
      prisma.variant.findFirst.mockResolvedValueOnce({ id: 'existing' });
      await expect(
        service.addVariantToStrategy(mockUser(), 's1', 'p1', {
          name: 'duplicate',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when payload without payloadType', async () => {
      seedStrategy();
      prisma.variant.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.addVariantToStrategy(mockUser(), 's1', 'p1', {
          name: 'new-variant',
          payload: 'value',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when variant already added to strategy', async () => {
      seedStrategy();
      prisma.variant.findUnique.mockResolvedValueOnce({
        id: 'v1',
        featureFlagId: 'ff1',
      });
      prisma.strategyVariant.findUnique.mockResolvedValueOnce({
        id: 'sv-existing',
      });
      await expect(
        service.addVariantToStrategy(mockUser(), 's1', 'p1', {
          variantId: 'v1',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when custom weight sum exceeds 100', async () => {
      seedStrategy();
      prisma.variant.findUnique.mockResolvedValueOnce({
        id: 'v1',
        featureFlagId: 'ff1',
      });
      prisma.strategyVariant.findUnique.mockResolvedValueOnce(null);
      prisma.strategyVariant.findMany.mockResolvedValueOnce([
        { weight: 80, isCustomWeight: true },
      ]);
      await expect(
        service.addVariantToStrategy(mockUser(), 's1', 'p1', {
          variantId: 'v1',
          isCustomWeight: true,
          weight: 30,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates new variant + strategyVariant and logs audit', async () => {
      seedStrategy();
      prisma.variant.findFirst.mockResolvedValueOnce(null);
      prisma.variant.create.mockResolvedValueOnce({ id: 'v-new' });
      prisma.strategyVariant.findUnique
        .mockResolvedValueOnce(null) // existing check
        .mockResolvedValueOnce({
          // final fetch
          id: 'sv1',
          variantId: 'v-new',
          variant: { id: 'v-new', name: 'new-v' },
        });
      prisma.strategyVariant.create.mockResolvedValueOnce({ id: 'sv1' });
      prisma.strategyVariant.findMany.mockResolvedValueOnce([]); // redistribute

      const result = await service.addVariantToStrategy(
        mockUser(),
        's1',
        'p1',
        {
          name: 'new-v',
          payloadType: 'STRING',
          payload: 'val',
        } as any,
      );
      expect(result).toMatchObject({ id: 'sv1' });
      expect(
        environmentService.incrementEnvironmentVersion,
      ).toHaveBeenCalledWith('e1');
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE' }),
      );
    });
  });

  describe('batchAddVariantsToStrategy', () => {
    it('throws NotFound when strategy missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.batchAddVariantsToStrategy(mockUser(), 'p1', 's1', {
          variants: [],
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('processes all variants in batch', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findUnique.mockResolvedValueOnce({
        id: 's1',
        name: 'strat',
        featureFlagEnvironment: {
          featureFlagId: 'ff1',
          environmentId: 'e1',
          environment: { id: 'e1', name: 'prod' },
          featureFlag: { id: 'ff1' },
        },
      });
      // For each variant: variantId lookup -> found
      prisma.variant.findUnique
        .mockResolvedValueOnce({ id: 'v1', featureFlagId: 'ff1' })
        .mockResolvedValueOnce({ id: 'v2', featureFlagId: 'ff1' });
      // existingSV check (null) + final fetch for each variant (interleaved per variant)
      prisma.strategyVariant.findUnique
        .mockResolvedValueOnce(null) // v1 existing check
        .mockResolvedValueOnce({ variantId: 'v1', variant: { name: 'a' } }) // v1 final
        .mockResolvedValueOnce(null) // v2 existing check
        .mockResolvedValueOnce({ variantId: 'v2', variant: { name: 'b' } }); // v2 final
      prisma.strategyVariant.create.mockResolvedValue({ id: 'sv' });
      // redistributeNonCustomWeights called for each variant
      prisma.strategyVariant.findMany.mockResolvedValue([]);

      const result = await service.batchAddVariantsToStrategy(
        mockUser(),
        'p1',
        's1',
        {
          variants: [{ variantId: 'v1' }, { variantId: 'v2' }],
        } as any,
      );
      expect(result).toHaveLength(2);
      expect(
        environmentService.incrementEnvironmentVersion,
      ).toHaveBeenCalledWith('e1');
    });
  });

  describe('updateStrategyVariant', () => {
    it('throws NotFound when strategy missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.updateStrategyVariant(mockUser(), 'p1', 's1', 'v1', {} as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFound when strategyVariant missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findUnique.mockResolvedValueOnce({
        id: 's1',
        featureFlagEnvironment: { environment: { id: 'e1', name: 'prod' } },
      });
      prisma.strategyVariant.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.updateStrategyVariant(mockUser(), 'p1', 's1', 'v1', {} as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest when new custom weight exceeds 100', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findUnique.mockResolvedValueOnce({
        id: 's1',
        featureFlagEnvironment: { environment: { id: 'e1', name: 'prod' } },
      });
      prisma.strategyVariant.findUnique.mockResolvedValueOnce({
        id: 'sv1',
        weight: 0,
        isCustomWeight: false,
      });
      prisma.strategyVariant.findMany.mockResolvedValueOnce([
        { weight: 80, isCustomWeight: true },
      ]);

      await expect(
        service.updateStrategyVariant(mockUser(), 'p1', 's1', 'v1', {
          isCustomWeight: true,
          weight: 30,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('updates weight and logs audit', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findUnique.mockResolvedValueOnce({
        id: 's1',
        name: 'strat',
        featureFlagEnvironment: {
          environmentId: 'e1',
          environment: { id: 'e1', name: 'prod' },
        },
      });
      prisma.strategyVariant.findUnique
        .mockResolvedValueOnce({
          id: 'sv1',
          weight: 0,
          isCustomWeight: false,
        })
        .mockResolvedValueOnce({
          id: 'sv1',
          variantId: 'v1',
          variant: { name: 'var' },
        });
      prisma.strategyVariant.update.mockResolvedValueOnce({ id: 'sv1' });
      // redistributeNonCustomWeights
      prisma.strategyVariant.findMany.mockResolvedValue([]);

      const result = await service.updateStrategyVariant(
        mockUser(),
        'p1',
        's1',
        'v1',
        {
          isCustomWeight: true,
          weight: 50,
        } as any,
      );
      expect(result).toMatchObject({ id: 'sv1' });
      expect(
        environmentService.incrementEnvironmentVersion,
      ).toHaveBeenCalledWith('e1');
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE' }),
      );
    });
  });

  describe('removeVariantFromStrategy', () => {
    it('throws NotFound when strategyVariant missing', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategyVariant.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.removeVariantFromStrategy(mockUser(), 'p1', 's1', 'v1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deletes, redistributes, increments version, logs audit', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategyVariant.findUnique.mockResolvedValueOnce({
        id: 'sv1',
        variantId: 'v1',
        variant: { id: 'v1', name: 'var' },
        strategy: {
          id: 's1',
          name: 'strat',
          featureFlagEnvironment: {
            environmentId: 'e1',
            environment: { id: 'e1', name: 'prod' },
          },
        },
      });
      prisma.strategyVariant.delete.mockResolvedValueOnce({ id: 'sv1' });
      // redistributeNonCustomWeights
      prisma.strategyVariant.findMany.mockResolvedValueOnce([]);

      const result = await service.removeVariantFromStrategy(
        mockUser(),
        'p1',
        's1',
        'v1',
      );
      expect(result).toEqual({
        message: 'Variant removed from strategy successfully',
      });
      expect(
        environmentService.incrementEnvironmentVersion,
      ).toHaveBeenCalledWith('e1');
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          resourceType: 'STRATEGY_VARIANT',
        }),
      );
    });
  });

  describe('getProjectByIdOrSlug (private, tested via findAllStrategies path)', () => {
    it('throws NotFound when project missing (via deleteStrategy)', async () => {
      prisma.project.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.deleteStrategy(mockUser(), 's1', 'p1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns project with organization (via deleteStrategy)', async () => {
      prisma.project.findFirst.mockResolvedValueOnce({
        id: 'p1',
        organizationId: 'o1',
      });
      prisma.strategy.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.deleteStrategy(mockUser(), 's1', 'p1'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ id: 'p1' }, { slug: 'p1' }] },
        include: { organization: true },
      });
    });
  });
});
