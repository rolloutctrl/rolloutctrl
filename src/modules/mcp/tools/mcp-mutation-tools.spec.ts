import { Test, TestingModule } from '@nestjs/testing';
import { ToolRegistry } from './tool.registry';
import { McpPermissions } from '../mcp.permissions';
import { McpAuditService } from '../mcp-audit.service';
import { McpDryRunService } from '../mcp-dry-run';
import { FlagMutationTools } from './flag-mutation.tools';
import { StrategyMutationTools } from './strategy-mutation.tools';
import { VariantMutationTools } from './variant-mutation.tools';
import { SegmentMutationTools } from './segment-mutation.tools';
import { ActionMutationTools } from './action-mutation.tools';
import { FeatureFlagService } from '../../feature-flag/feature-flag.service';
import { StrategyService } from '../../strategy/strategy.service';
import { VariantService } from '../../variant/variant.service';
import { SegmentService } from '../../segment/segment.service';
import { ActionService } from '../../action/action.service';
import type { McpRequestContext } from '../mcp.types';

/**
 * Tests for Task 5 mutation tools: registration + scope/permission enforcement.
 *
 * Verifies that mutation tools delegate to the underlying services with the
 * correct arguments, that out-of-scope projectId is rejected without
 * invoking the service, and that `update_flag` strips the prohibited
 * `archived` field.
 */
describe('MCP mutation tools (Task 5)', () => {
  let moduleRef: TestingModule;
  let registry: ToolRegistry;
  let flags: jest.Mocked<FeatureFlagService>;
  let strategies: jest.Mocked<StrategyService>;
  let variants: jest.Mocked<VariantService>;
  let segments: jest.Mocked<SegmentService>;
  let actions: jest.Mocked<ActionService>;

  function ctx(overrides: Partial<McpRequestContext> = {}): McpRequestContext {
    return {
      user: { id: 'agent_user_1' } as any,
      scope: { projectId: 'proj_1', projectSlug: null, environmentId: null },
      ...overrides,
    };
  }

  beforeEach(async () => {
    flags = {
      createFeatureFlag: jest.fn(),
      updateFeatureFlag: jest.fn(),
      configureFlagForEnvironment: jest.fn(),
    } as any;
    strategies = {
      createStrategy: jest.fn(),
      updateStrategy: jest.fn(),
      toggleStrategyEnable: jest.fn(),
    } as any;
    variants = { createVariant: jest.fn(), updateVariant: jest.fn() } as any;
    segments = { createSegment: jest.fn(), updateSegment: jest.fn() } as any;
    actions = { createAction: jest.fn(), updateAction: jest.fn() } as any;

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
        {
          provide: McpDryRunService,
          useValue: {
            isProductionEnvironment: jest.fn().mockResolvedValue(false),
          },
        },
        { provide: FeatureFlagService, useValue: flags },
        { provide: StrategyService, useValue: strategies },
        { provide: VariantService, useValue: variants },
        { provide: SegmentService, useValue: segments },
        { provide: ActionService, useValue: actions },
        FlagMutationTools,
        StrategyMutationTools,
        VariantMutationTools,
        SegmentMutationTools,
        ActionMutationTools,
      ],
    }).compile();

    registry = moduleRef.get(ToolRegistry);

    const flagM = moduleRef.get(FlagMutationTools);
    const stratM = moduleRef.get(StrategyMutationTools);
    const varM = moduleRef.get(VariantMutationTools);
    const segM = moduleRef.get(SegmentMutationTools);
    const actM = moduleRef.get(ActionMutationTools);
    for (const tool of [
      ...flagM.all(),
      ...stratM.all(),
      ...varM.all(),
      ...segM.all(),
      ...actM.all(),
    ]) {
      registry.register(tool);
    }
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  const EXPECTED_MUTATION_TOOLS = [
    'create_flag',
    'update_flag',
    'enable_flag',
    'disable_flag',
    'create_strategy',
    'update_strategy',
    'toggle_strategy',
    'create_variant',
    'update_variant',
    'create_segment',
    'update_segment',
    'create_action',
    'update_action',
  ];

  it('registers all 13 mutation tools', () => {
    expect(registry.size).toBe(13);
    for (const name of EXPECTED_MUTATION_TOOLS) {
      expect(registry.names).toContain(name);
    }
  });

  describe('create_flag', () => {
    it('calls service with in-scope projectId', async () => {
      const tool = (registry as any).tools.get('create_flag');
      await tool.handler(
        { projectId: 'proj_1', key: 'new-flag', description: 'desc' },
        ctx(),
      );
      expect(flags.createFeatureFlag).toHaveBeenCalledWith(
        ctx().user,
        'proj_1',
        expect.objectContaining({ key: 'new-flag', description: 'desc' }),
      );
    });

    it('rejects out-of-scope projectId', async () => {
      const tool = (registry as any).tools.get('create_flag');
      await expect(
        tool.handler({ projectId: 'proj_other', key: 'f' }, ctx()),
      ).rejects.toThrow();
      expect(flags.createFeatureFlag).not.toHaveBeenCalled();
    });
  });

  describe('update_flag', () => {
    it('calls service and strips `archived`', async () => {
      const tool = (registry as any).tools.get('update_flag');
      // Agent attempts to pass `archived` — must be stripped.
      await tool.handler(
        { projectId: 'proj_1', flagId: 'f1', key: 'new-key', archived: true },
        ctx(),
      );
      expect(flags.updateFeatureFlag).toHaveBeenCalledWith(
        'f1',
        'proj_1',
        expect.not.objectContaining({ archived: true }),
      );
      expect(flags.updateFeatureFlag).toHaveBeenCalledWith(
        'f1',
        'proj_1',
        expect.objectContaining({ key: 'new-key' }),
      );
    });

    it('rejects out-of-scope projectId', async () => {
      const tool = (registry as any).tools.get('update_flag');
      await expect(
        tool.handler({ projectId: 'proj_other', flagId: 'f' }, ctx()),
      ).rejects.toThrow();
      expect(flags.updateFeatureFlag).not.toHaveBeenCalled();
    });
  });

  describe('enable_flag', () => {
    it('calls configureFlagForEnvironment with enabled=true', async () => {
      const tool = (registry as any).tools.get('enable_flag');
      await tool.handler(
        { projectId: 'proj_1', flagId: 'f1', environmentId: 'env_1' },
        ctx(),
      );
      expect(flags.configureFlagForEnvironment).toHaveBeenCalledWith(
        ctx().user,
        expect.objectContaining({ enabled: true, environmentId: 'env_1' }),
      );
    });

    it('rejects when environment is pinned and differs', async () => {
      const tool = (registry as any).tools.get('enable_flag');
      const pinnedCtx = ctx({
        scope: {
          projectId: 'proj_1',
          projectSlug: null,
          environmentId: 'env_pinned',
        },
      });
      await expect(
        tool.handler(
          { projectId: 'proj_1', flagId: 'f', environmentId: 'env_other' },
          pinnedCtx,
        ),
      ).rejects.toThrow();
      expect(flags.configureFlagForEnvironment).not.toHaveBeenCalled();
    });
  });

  describe('disable_flag', () => {
    it('calls configureFlagForEnvironment with enabled=false', async () => {
      const tool = (registry as any).tools.get('disable_flag');
      await tool.handler(
        { projectId: 'proj_1', flagId: 'f1', environmentId: 'env_1' },
        ctx(),
      );
      expect(flags.configureFlagForEnvironment).toHaveBeenCalledWith(
        ctx().user,
        expect.objectContaining({ enabled: false }),
      );
    });
  });

  describe('create_strategy', () => {
    it('calls service with in-scope projectId', async () => {
      const tool = (registry as any).tools.get('create_strategy');
      await tool.handler(
        {
          projectId: 'proj_1',
          featureFlagEnvironmentIds: ['ffe_1'],
          rolloutPercentage: 50,
          rolloutStickinessField: 'userId',
        },
        ctx(),
      );
      expect(strategies.createStrategy).toHaveBeenCalledWith(
        ctx().user,
        expect.objectContaining({ featureFlagEnvironmentIds: ['ffe_1'] }),
      );
    });

    it('rejects out-of-scope projectId', async () => {
      const tool = (registry as any).tools.get('create_strategy');
      await expect(
        tool.handler(
          { projectId: 'proj_other', featureFlagEnvironmentIds: ['ffe'] },
          ctx(),
        ),
      ).rejects.toThrow();
      expect(strategies.createStrategy).not.toHaveBeenCalled();
    });
  });

  describe('update_strategy', () => {
    it('calls service with strategyId separated from dto', async () => {
      const tool = (registry as any).tools.get('update_strategy');
      await tool.handler(
        {
          projectId: 'proj_1',
          strategyId: 's1',
          rolloutPercentage: 75,
          rolloutStickinessField: 'userId',
        },
        ctx(),
      );
      expect(strategies.updateStrategy).toHaveBeenCalledWith(
        ctx().user,
        's1',
        expect.objectContaining({ rolloutPercentage: 75 }),
      );
    });
  });

  describe('toggle_strategy', () => {
    it('calls toggleStrategyEnable with correct args', async () => {
      const tool = (registry as any).tools.get('toggle_strategy');
      await tool.handler(
        { projectId: 'proj_1', strategyId: 's1', enabled: false },
        ctx(),
      );
      expect(strategies.toggleStrategyEnable).toHaveBeenCalledWith(
        's1',
        ctx().user,
        false,
        'proj_1',
      );
    });
  });

  describe('create_variant', () => {
    it('calls service with in-scope projectId', async () => {
      const tool = (registry as any).tools.get('create_variant');
      await tool.handler(
        {
          projectId: 'proj_1',
          featureFlagId: 'f1',
          name: 'Control',
          colorTag: 'blue',
        },
        ctx(),
      );
      expect(variants.createVariant).toHaveBeenCalledWith(
        ctx().user,
        expect.objectContaining({ name: 'Control' }),
      );
    });

    it('rejects out-of-scope projectId', async () => {
      const tool = (registry as any).tools.get('create_variant');
      await expect(
        tool.handler(
          {
            projectId: 'proj_other',
            featureFlagId: 'f',
            name: 'v',
            colorTag: 'blue',
          },
          ctx(),
        ),
      ).rejects.toThrow();
      expect(variants.createVariant).not.toHaveBeenCalled();
    });
  });

  describe('update_variant', () => {
    it('calls service with variantId separated from dto', async () => {
      const tool = (registry as any).tools.get('update_variant');
      await tool.handler(
        { projectId: 'proj_1', variantId: 'v1', name: 'New' },
        ctx(),
      );
      expect(variants.updateVariant).toHaveBeenCalledWith(
        ctx().user,
        'v1',
        expect.objectContaining({ name: 'New' }),
      );
    });
  });

  describe('create_segment', () => {
    it('calls service with in-scope projectId', async () => {
      const tool = (registry as any).tools.get('create_segment');
      await tool.handler(
        { projectId: 'proj_1', key: 'us-users', name: 'US Users', rules: [] },
        ctx(),
      );
      expect(segments.createSegment).toHaveBeenCalledWith(
        ctx().user,
        expect.objectContaining({ key: 'us-users' }),
      );
    });
  });

  describe('update_segment', () => {
    it('calls service with projectId + segmentId separated from dto', async () => {
      const tool = (registry as any).tools.get('update_segment');
      await tool.handler(
        {
          projectId: 'proj_1',
          segmentId: 'seg_1',
          key: 'us',
          name: 'US',
          rules: [],
        },
        ctx(),
      );
      expect(segments.updateSegment).toHaveBeenCalledWith(
        ctx().user,
        'proj_1',
        'seg_1',
        expect.objectContaining({ key: 'us' }),
      );
    });
  });

  describe('create_action', () => {
    it('calls service with in-scope projectId', async () => {
      const tool = (registry as any).tools.get('create_action');
      await tool.handler({ projectId: 'proj_1', key: 'my-action' }, ctx());
      expect(actions.createAction).toHaveBeenCalledWith(
        ctx().user,
        expect.objectContaining({ key: 'my-action' }),
      );
    });
  });

  describe('update_action', () => {
    it('calls service with projectId + actionId separated from dto', async () => {
      const tool = (registry as any).tools.get('update_action');
      await tool.handler(
        { projectId: 'proj_1', actionId: 'act_1', description: 'new' },
        ctx(),
      );
      expect(actions.updateAction).toHaveBeenCalledWith(
        ctx().user,
        'proj_1',
        'act_1',
        expect.objectContaining({ description: 'new' }),
      );
    });
  });
});
