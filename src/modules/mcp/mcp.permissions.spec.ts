import { Test, TestingModule } from '@nestjs/testing';
import { McpPermissions, AGENT_PERMISSIONS } from './mcp.permissions';
import { PermissionCode } from 'src/common/constants/permissions.constants';
import { McpToolError } from './mcp.types';
import type { McpRequestContext } from './mcp.types';

describe('McpPermissions', () => {
  let moduleRef: TestingModule;
  let perms: McpPermissions;

  function ctx(overrides: Partial<McpRequestContext> = {}): McpRequestContext {
    return {
      user: { id: 'agent_user_1' } as any,
      scope: {
        projectId: 'proj_1',
        projectSlug: 'proj-1',
        environmentId: null,
      },
      apiKeyPreview: 'rctrl-agent-test',
      ...overrides,
    };
  }

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [McpPermissions],
    }).compile();
    perms = moduleRef.get(McpPermissions);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  describe('requirePermission', () => {
    it('passes for a permission in the AGENT allowlist', () => {
      expect(() =>
        perms.requirePermission(ctx(), PermissionCode.FLAG_READ),
      ).not.toThrow();
    });

    it('throws forbidden for a permission not in the AGENT allowlist', () => {
      expect(() =>
        perms.requirePermission(ctx(), PermissionCode.FLAG_DELETE),
      ).toThrow(McpToolError);
    });

    it('throws forbidden for org/project/user management permissions', () => {
      const forbidden = [
        PermissionCode.ORG_MANAGE,
        PermissionCode.PROJECT_CREATE,
        PermissionCode.PROJECT_DELETE,
        PermissionCode.PROJECT_MEMBERS_MANAGE,
        PermissionCode.API_KEY_CREATE,
        PermissionCode.API_KEY_REVOKE,
      ];
      for (const code of forbidden) {
        expect(() => perms.requirePermission(ctx(), code)).toThrow(
          McpToolError,
        );
      }
    });

    it('AGENT_PERMISSIONS does not include any delete permissions', () => {
      const deleteCodes = Object.values(PermissionCode).filter((c) =>
        c.endsWith('.delete'),
      );
      for (const code of deleteCodes) {
        expect(AGENT_PERMISSIONS.has(code)).toBe(false);
      }
    });
  });

  describe('requireProjectScope', () => {
    it('passes when projectId matches scope.projectId', () => {
      expect(() => perms.requireProjectScope(ctx(), 'proj_1')).not.toThrow();
    });

    it('passes when projectId matches scope.projectSlug', () => {
      expect(() => perms.requireProjectScope(ctx(), 'proj-1')).not.toThrow();
    });

    it('throws forbidden when projectId is out of scope', () => {
      expect(() => perms.requireProjectScope(ctx(), 'proj_other')).toThrow(
        McpToolError,
      );
    });
  });

  describe('requireEnvironmentScope', () => {
    it('passes any environment when scope.environmentId is null', () => {
      expect(() =>
        perms.requireEnvironmentScope(ctx(), 'env_any'),
      ).not.toThrow();
    });

    it('passes when environmentId matches pinned scope', () => {
      const c = ctx({
        scope: {
          projectId: 'proj_1',
          projectSlug: null,
          environmentId: 'env_1',
        },
      });
      expect(() => perms.requireEnvironmentScope(c, 'env_1')).not.toThrow();
    });

    it('throws forbidden when environmentId differs from pinned scope', () => {
      const c = ctx({
        scope: {
          projectId: 'proj_1',
          projectSlug: null,
          environmentId: 'env_1',
        },
      });
      expect(() => perms.requireEnvironmentScope(c, 'env_other')).toThrow(
        McpToolError,
      );
    });
  });
});
