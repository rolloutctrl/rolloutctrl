import { Test, TestingModule } from '@nestjs/testing';
import { ToolRegistry } from './tool.registry';
import { McpPermissions } from '../mcp.permissions';
import { McpAuditService } from '../mcp-audit.service';
import { McpDryRunService } from '../mcp-dry-run';
import { McpToolError } from '../mcp.types';
import { FlagReadTools } from './flag-read.tools';
import { FlagMutationTools } from './flag-mutation.tools';
import { FeatureFlagService } from '../../feature-flag/feature-flag.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrismaService } from 'src/common/testing/mock-prisma';
import type { McpRequestContext } from '../mcp.types';

/**
 * Task 6 security/quality tests:
 *  - delete operations are not registered (architectural prohibition)
 *  - organization/project isolation (cross-scope rejection)
 *  - unknown tool handling
 *  - audit logging records tool calls without secrets
 *  - dry-run preview for production environments
 */
describe('MCP Task 6: security, audit, dry-run', () => {
  let moduleRef: TestingModule;
  let registry: ToolRegistry;
  let audit: jest.Mocked<McpAuditService>;
  let dryRun: jest.Mocked<McpDryRunService>;
  let flags: jest.Mocked<FeatureFlagService>;
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
      createFeatureFlag: jest.fn(),
      updateFeatureFlag: jest.fn(),
      configureFlagForEnvironment: jest.fn(),
      findAllFeatureFlags: jest.fn(),
      findFeatureFlagById: jest.fn(),
      getFlagEnvironmentConfig: jest.fn(),
      getAllEnvironmentsConfig: jest.fn(),
    } as any;
    audit = {
      record: jest.fn().mockResolvedValue(undefined),
      resolveOrganizationId: jest.fn().mockResolvedValue('org_1'),
    } as any;
    dryRun = {
      isProductionEnvironment: jest.fn(),
    } as any;

    moduleRef = await Test.createTestingModule({
      providers: [
        ToolRegistry,
        McpPermissions,
        { provide: McpAuditService, useValue: audit },
        { provide: McpDryRunService, useValue: dryRun },
        { provide: PrismaService, useValue: prisma },
        { provide: FeatureFlagService, useValue: flags },
        FlagReadTools,
        FlagMutationTools,
      ],
    }).compile();

    registry = moduleRef.get(ToolRegistry);
    const flagRead = moduleRef.get(FlagReadTools);
    const flagMut = moduleRef.get(FlagMutationTools);
    for (const tool of [...flagRead.all(), ...flagMut.all()]) {
      registry.register(tool);
    }
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  describe('delete prohibition (architectural)', () => {
    it('no delete_* tool is registered', () => {
      const names = registry.names;
      const deleteTools = names.filter((n) => n.startsWith('delete_'));
      expect(deleteTools).toEqual([]);
    });

    it('no archive_flag tool is registered (archived is prohibited via MCP)', () => {
      expect(registry.names).not.toContain('archive_flag');
      expect(registry.names).not.toContain('delete_flag');
      expect(registry.names).not.toContain('delete_strategy');
      expect(registry.names).not.toContain('delete_variant');
      expect(registry.names).not.toContain('delete_segment');
      expect(registry.names).not.toContain('delete_action');
    });
  });

  describe('organization/project isolation', () => {
    it('rejects projectId from another organization', async () => {
      const tool = (registry as any).tools.get('list_flags');
      await expect(
        tool.handler({ projectId: 'proj_other_org' }, ctx()),
      ).rejects.toThrow(McpToolError);
      expect(flags.findAllFeatureFlags).not.toHaveBeenCalled();
    });

    it('rejects cross-project access even if both projects exist', async () => {
      const tool = (registry as any).tools.get('get_flag');
      await expect(
        tool.handler(
          { projectId: 'proj_other', flagId: 'flag_1' },
          ctx({
            scope: {
              projectId: 'proj_1',
              projectSlug: null,
              environmentId: null,
            },
          }),
        ),
      ).rejects.toThrow(McpToolError);
      expect(flags.findFeatureFlagById).not.toHaveBeenCalled();
    });

    it('rejects environment outside pinned scope', async () => {
      const tool = (registry as any).tools.get('get_flag_config');
      const pinnedCtx = ctx({
        scope: {
          projectId: 'proj_1',
          projectSlug: null,
          environmentId: 'env_allowed',
        },
      });
      await expect(
        tool.handler({ flagId: 'f', environmentId: 'env_blocked' }, pinnedCtx),
      ).rejects.toThrow(McpToolError);
      expect(flags.getFlagEnvironmentConfig).not.toHaveBeenCalled();
    });
  });

  describe('unknown tool handling', () => {
    it('registry does not contain arbitrary tool names', () => {
      expect(registry.names).not.toContain('delete_organization');
      expect(registry.names).not.toContain('create_user');
      expect(registry.names).not.toContain('revoke_api_key');
      expect(registry.names).not.toContain('manage_permissions');
      expect(registry.names).not.toContain('arbitrary_http');
    });
  });

  describe('audit logging (no secrets)', () => {
    // Audit is recorded in the attachTo wrapper, not in the raw handler.
    // We build a minimal mock McpServer to capture the wrapped handler.
    function captureWrappedHandler(toolName: string, ctx: McpRequestContext) {
      let wrapped: ((args: any) => Promise<any>) | null = null;
      const mockServer: any = {
        registerTool: (_name: string, _opts: any, fn: any) => {
          if (_name === toolName) wrapped = fn;
        },
      };
      registry.attachTo(mockServer as any, ctx);
      if (!wrapped) throw new Error(`tool ${toolName} not attached`);
      return wrapped;
    }

    it('audit.record is called with tool name, userId, success, duration (no args)', async () => {
      const wrapped = captureWrappedHandler('list_flags', ctx());
      await wrapped({ projectId: 'proj_1' });

      // Audit is fire-and-forget; wait for microtasks.
      await new Promise((r) => setImmediate(r));

      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          tool: 'list_flags',
          userId: 'agent_user_1',
          projectId: 'proj_1',
          success: true,
        }),
      );
      // The audit entry must NOT contain tool arguments (secrets could leak).
      const entry =
        audit.record.mock.calls[audit.record.mock.calls.length - 1][0];
      expect(entry).not.toHaveProperty('args');
      expect(entry).not.toHaveProperty('arguments');
    });

    it('audit.record captures failure when handler throws', async () => {
      const wrapped = captureWrappedHandler('list_flags', ctx());
      // Out-of-scope project -> handler throws (but wrapper catches it).
      await wrapped({ projectId: 'proj_other' });
      await new Promise((r) => setImmediate(r));

      const entry =
        audit.record.mock.calls[audit.record.mock.calls.length - 1][0];
      expect(entry.success).toBe(false);
      expect(entry.error).toBeDefined();
    });
  });

  describe('dry-run preview for production', () => {
    it('enable_flag with dryRun=true does not call service and returns preview', async () => {
      dryRun.isProductionEnvironment.mockResolvedValueOnce(true);

      const tool = (registry as any).tools.get('enable_flag');
      const result = await tool.handler(
        {
          projectId: 'proj_1',
          flagId: 'f1',
          environmentId: 'env_prod',
          dryRun: true,
        },
        ctx(),
      );

      expect(result.wouldApply).toBe(true);
      expect(result.enabled).toBe(true);
      expect(result.isProduction).toBe(true);
      expect(flags.configureFlagForEnvironment).not.toHaveBeenCalled();
    });

    it('enable_flag with dryRun=false applies the change', async () => {
      dryRun.isProductionEnvironment.mockResolvedValueOnce(true);
      flags.configureFlagForEnvironment.mockResolvedValueOnce({
        id: 'ffe_1',
        enabled: true,
      } as any);

      const tool = (registry as any).tools.get('enable_flag');
      await tool.handler(
        {
          projectId: 'proj_1',
          flagId: 'f1',
          environmentId: 'env_prod',
          dryRun: false,
        },
        ctx(),
      );

      expect(flags.configureFlagForEnvironment).toHaveBeenCalled();
    });

    it('disable_flag with dryRun=true in non-production returns isProduction=false', async () => {
      dryRun.isProductionEnvironment.mockResolvedValueOnce(false);

      const tool = (registry as any).tools.get('disable_flag');
      const result = await tool.handler(
        {
          projectId: 'proj_1',
          flagId: 'f1',
          environmentId: 'env_dev',
          dryRun: true,
        },
        ctx(),
      );

      expect(result.isProduction).toBe(false);
      expect(flags.configureFlagForEnvironment).not.toHaveBeenCalled();
    });
  });

  describe('update_flag strips archived (prohibited field)', () => {
    it('archived is not passed to service even if agent sends it', async () => {
      const tool = (registry as any).tools.get('update_flag');
      await tool.handler(
        { projectId: 'proj_1', flagId: 'f1', key: 'new-key', archived: true },
        ctx(),
      );

      const dtoArg = flags.updateFeatureFlag.mock.calls[0][2];
      expect(dtoArg).not.toHaveProperty('archived');
      expect(dtoArg.key).toBe('new-key');
    });
  });
});
