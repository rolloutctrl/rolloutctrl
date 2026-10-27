import { Test, TestingModule } from '@nestjs/testing';
import { ToolRegistry } from './tool.registry';
import { McpPermissions } from '../mcp.permissions';
import { McpAuditService } from '../mcp-audit.service';
import { FlagReadTools } from './flag-read.tools';
import { EnvironmentReadTools } from './environment-read.tools';
import { StrategyReadTools } from './strategy-read.tools';
import { VariantReadTools } from './variant-read.tools';
import { SegmentReadTools } from './segment-read.tools';
import { ActionReadTools } from './action-read.tools';
import { AuditReadTools } from './audit-read.tools';
import { FeatureFlagService } from '../../feature-flag/feature-flag.service';
import { EnvironmentService } from '../../environment/environment.service';
import { StrategyService } from '../../strategy/strategy.service';
import { VariantService } from '../../variant/variant.service';
import { SegmentService } from '../../segment/segment.service';
import { ActionService } from '../../action/action.service';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrismaService } from 'src/common/testing/mock-prisma';
import type { McpRequestContext } from '../mcp.types';

/**
 * Tests for Task 4 read-only tools: registration + scope enforcement.
 *
 * Tools are instantiated directly (not via McpToolsModule) to avoid pulling
 * the full domain module graph into the test. The ToolRegistry is real; each
 * tool class is constructed with mocked services.
 */
describe('MCP read-only tools (Task 4)', () => {
  let moduleRef: TestingModule;
  let registry: ToolRegistry;
  let flags: jest.Mocked<FeatureFlagService>;
  let environments: jest.Mocked<EnvironmentService>;
  let strategies: jest.Mocked<StrategyService>;
  let variants: jest.Mocked<VariantService>;
  let segments: jest.Mocked<SegmentService>;
  let actions: jest.Mocked<ActionService>;
  let audit: jest.Mocked<AuditLogService>;
  let prisma: ReturnType<typeof createMockPrismaService>;

  function ctx(overrides: Partial<McpRequestContext> = {}): McpRequestContext {
    return {
      user: { id: 'agent_user_1' } as any,
      scope: { projectId: 'proj_1', projectSlug: null, environmentId: null },
      apiKeyPreview: 'rctrl-agent-test',
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = createMockPrismaService();
    flags = {
      findAllFeatureFlags: jest.fn(),
      findFeatureFlagById: jest.fn(),
      getFlagEnvironmentConfig: jest.fn(),
      getAllEnvironmentsConfig: jest.fn(),
    } as any;
    environments = { findAll: jest.fn(), findOne: jest.fn() } as any;
    strategies = {
      findAllStrategies: jest.fn(),
      findStrategyById: jest.fn(),
      findAllStrategyVariants: jest.fn(),
    } as any;
    variants = {
      findAllVariantsByFlagId: jest.fn(),
      findVariantById: jest.fn(),
    } as any;
    segments = {
      findAllSegments: jest.fn(),
      findSegmentById: jest.fn(),
    } as any;
    actions = { findAllActions: jest.fn(), findActionById: jest.fn() } as any;
    audit = { findByResource: jest.fn() } as any;

    moduleRef = await Test.createTestingModule({
      providers: [
        ToolRegistry,
        McpPermissions,
        {
          provide: McpAuditService,
          useValue: {
            record: jest.fn().mockResolvedValue(undefined),
            resolveOrganizationId: jest.fn().mockResolvedValue(undefined),
          },
        },
        { provide: PrismaService, useValue: prisma },
        { provide: FeatureFlagService, useValue: flags },
        { provide: EnvironmentService, useValue: environments },
        { provide: StrategyService, useValue: strategies },
        { provide: VariantService, useValue: variants },
        { provide: SegmentService, useValue: segments },
        { provide: ActionService, useValue: actions },
        { provide: AuditLogService, useValue: audit },
        FlagReadTools,
        EnvironmentReadTools,
        StrategyReadTools,
        VariantReadTools,
        SegmentReadTools,
        ActionReadTools,
        AuditReadTools,
      ],
    }).compile();

    registry = moduleRef.get(ToolRegistry);
    moduleRef.get(McpPermissions);

    // Register all read-only tools (mirrors McpToolsModule.onModuleInit).
    const flagTools = moduleRef.get(FlagReadTools);
    const envTools = moduleRef.get(EnvironmentReadTools);
    const stratTools = moduleRef.get(StrategyReadTools);
    const varTools = moduleRef.get(VariantReadTools);
    const segTools = moduleRef.get(SegmentReadTools);
    const actTools = moduleRef.get(ActionReadTools);
    const audTools = moduleRef.get(AuditReadTools);
    for (const tool of [
      ...flagTools.all(),
      ...envTools.all(),
      ...stratTools.all(),
      ...varTools.all(),
      ...segTools.all(),
      ...actTools.all(),
      ...audTools.all(),
    ]) {
      registry.register(tool);
    }
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  const EXPECTED_TOOLS = [
    'list_flags',
    'get_flag',
    'get_flag_config',
    'get_flag_all_configs',
    'list_environments',
    'get_environment',
    'list_strategies',
    'get_strategy',
    'list_strategy_variants',
    'list_variants',
    'get_variant',
    'list_segments',
    'get_segment',
    'list_actions',
    'get_action',
    'list_flag_actions',
  ];

  it('registers all 16 read-only tools', () => {
    expect(registry.size).toBe(16);
    for (const name of EXPECTED_TOOLS) {
      expect(registry.names).toContain(name);
    }
  });

  describe('list_flags', () => {
    it('calls service with in-scope projectId', async () => {
      const tool = (registry as any).tools.get('list_flags');
      await tool.handler({ projectId: 'proj_1', limit: 5 }, ctx());
      expect(flags.findAllFeatureFlags).toHaveBeenCalledWith(
        'proj_1',
        false,
        undefined,
        5,
      );
    });

    it('rejects out-of-scope projectId without calling service', async () => {
      const tool = (registry as any).tools.get('list_flags');
      await expect(
        tool.handler({ projectId: 'proj_other' }, ctx()),
      ).rejects.toThrow();
      expect(flags.findAllFeatureFlags).not.toHaveBeenCalled();
    });
  });

  describe('get_flag', () => {
    it('calls service with in-scope projectId', async () => {
      const tool = (registry as any).tools.get('get_flag');
      await tool.handler({ projectId: 'proj_1', flagId: 'flag_1' }, ctx());
      expect(flags.findFeatureFlagById).toHaveBeenCalledWith(
        'flag_1',
        'proj_1',
      );
    });

    it('rejects out-of-scope projectId', async () => {
      const tool = (registry as any).tools.get('get_flag');
      await expect(
        tool.handler({ projectId: 'proj_other', flagId: 'f' }, ctx()),
      ).rejects.toThrow();
      expect(flags.findFeatureFlagById).not.toHaveBeenCalled();
    });
  });

  describe('get_flag_config', () => {
    it('calls service when environment is not pinned', async () => {
      const tool = (registry as any).tools.get('get_flag_config');
      await tool.handler({ flagId: 'flag_1', environmentId: 'env_1' }, ctx());
      expect(flags.getFlagEnvironmentConfig).toHaveBeenCalledWith(
        'flag_1',
        'env_1',
      );
    });

    it('rejects when environment is pinned and differs', async () => {
      const tool = (registry as any).tools.get('get_flag_config');
      const pinnedCtx = ctx({
        scope: {
          projectId: 'proj_1',
          projectSlug: null,
          environmentId: 'env_pinned',
        },
      });
      await expect(
        tool.handler({ flagId: 'f', environmentId: 'env_other' }, pinnedCtx),
      ).rejects.toThrow();
      expect(flags.getFlagEnvironmentConfig).not.toHaveBeenCalled();
    });
  });

  describe('list_environments', () => {
    it('calls service with in-scope projectId', async () => {
      const tool = (registry as any).tools.get('list_environments');
      await tool.handler({ projectId: 'proj_1' }, ctx());
      expect(environments.findAll).toHaveBeenCalledWith('proj_1');
    });

    it('rejects out-of-scope projectId', async () => {
      const tool = (registry as any).tools.get('list_environments');
      await expect(
        tool.handler({ projectId: 'proj_other' }, ctx()),
      ).rejects.toThrow();
      expect(environments.findAll).not.toHaveBeenCalled();
    });
  });

  describe('get_strategy', () => {
    it('rejects when strategy belongs to out-of-scope project', async () => {
      strategies.findStrategyById.mockResolvedValueOnce({
        id: 's1',
        featureFlagEnvironment: {
          featureFlag: { projectId: 'proj_other' },
          environmentId: 'env_1',
        },
      } as any);

      const tool = (registry as any).tools.get('get_strategy');
      await expect(tool.handler({ strategyId: 's1' }, ctx())).rejects.toThrow();
    });

    it('returns strategy when project is in scope', async () => {
      strategies.findStrategyById.mockResolvedValueOnce({
        id: 's1',
        featureFlagEnvironment: {
          featureFlag: { projectId: 'proj_1' },
          environmentId: 'env_1',
        },
      } as any);

      const tool = (registry as any).tools.get('get_strategy');
      const result = await tool.handler({ strategyId: 's1' }, ctx());
      expect(result).toBeDefined();
      expect(strategies.findStrategyById).toHaveBeenCalledWith('s1');
    });
  });

  describe('list_variants', () => {
    it('calls service with in-scope projectId', async () => {
      const tool = (registry as any).tools.get('list_variants');
      await tool.handler({ projectId: 'proj_1', flagId: 'flag_1' }, ctx());
      expect(variants.findAllVariantsByFlagId).toHaveBeenCalledWith(
        'flag_1',
        'proj_1',
      );
    });

    it('rejects out-of-scope projectId', async () => {
      const tool = (registry as any).tools.get('list_variants');
      await expect(
        tool.handler({ projectId: 'proj_other', flagId: 'f' }, ctx()),
      ).rejects.toThrow();
      expect(variants.findAllVariantsByFlagId).not.toHaveBeenCalled();
    });
  });

  describe('list_segments', () => {
    it('calls service with in-scope projectId', async () => {
      const tool = (registry as any).tools.get('list_segments');
      await tool.handler({ projectId: 'proj_1' }, ctx());
      expect(segments.findAllSegments).toHaveBeenCalledWith('proj_1');
    });
  });

  describe('list_actions', () => {
    it('calls service with in-scope projectId and pagination', async () => {
      const tool = (registry as any).tools.get('list_actions');
      await tool.handler(
        { projectId: 'proj_1', cursor: 'c1', limit: 10 },
        ctx(),
      );
      expect(actions.findAllActions).toHaveBeenCalledWith('proj_1', 'c1', 10);
    });
  });

  describe('list_flag_actions', () => {
    it('returns empty when flag not found in scope', async () => {
      prisma.featureFlag.findFirst.mockResolvedValueOnce(null);
      const tool = (registry as any).tools.get('list_flag_actions');
      const result = await tool.handler(
        { projectId: 'proj_1', flagId: 'missing' },
        ctx(),
      );
      expect(result).toEqual({ data: [], nextCursor: null, hasMore: false });
      expect(audit.findByResource).not.toHaveBeenCalled();
    });

    it('calls audit service when flag is in scope', async () => {
      prisma.featureFlag.findFirst.mockResolvedValueOnce({
        id: 'flag_1',
      } as any);
      audit.findByResource.mockResolvedValueOnce([{ id: 'log_1' } as any]);
      const tool = (registry as any).tools.get('list_flag_actions');
      const result = await tool.handler(
        { projectId: 'proj_1', flagId: 'flag_1' },
        ctx(),
      );
      expect(audit.findByResource).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
    });

    it('rejects out-of-scope projectId', async () => {
      const tool = (registry as any).tools.get('list_flag_actions');
      await expect(
        tool.handler({ projectId: 'proj_other', flagId: 'f' }, ctx()),
      ).rejects.toThrow();
      expect(audit.findByResource).not.toHaveBeenCalled();
    });
  });
});
