import { Test, TestingModule } from '@nestjs/testing';
import { McpController } from './mcp.controller';
import { McpServerFactory } from './tools/mcp-server.factory';
import { ToolRegistry } from './tools/tool.registry';
import { McpAuditService } from './mcp-audit.service';
import { McpAuthGuard } from './mcp-auth.guard';

/**
 * Smoke tests for the MCP Streamable HTTP endpoint (Task 2 + Task 3 auth).
 *
 * The McpServerFactory is mocked so we don't need a real MCP client; we
 * assert the factory is invoked with the right context (user + scope) and
 * that the controller drives the transport + close lifecycle correctly.
 */
describe('McpController', () => {
  let moduleRef: TestingModule;
  let controller: McpController;
  let factory: jest.Mocked<McpServerFactory>;
  let handleRequest: jest.Mock;
  let serverClose: jest.Mock;

  beforeEach(async () => {
    handleRequest = jest.fn().mockResolvedValue(undefined);
    serverClose = jest.fn().mockResolvedValue(undefined);

    factory = {
      create: jest.fn().mockResolvedValue({
        server: { close: serverClose },
        transport: { handleRequest },
      }),
    } as unknown as jest.Mocked<McpServerFactory>;

    moduleRef = await Test.createTestingModule({
      controllers: [McpController],
      providers: [
        { provide: McpServerFactory, useValue: factory },
        ToolRegistry,
        {
          provide: McpAuditService,
          useValue: {
            record: jest.fn().mockResolvedValue(undefined),
            resolveOrganizationId: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    })
      // Bypass AGENT API key auth: always allow, attach a fake agent user
      // and a fake API key scope.
      .overrideGuard(McpAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = {
            user: {
              id: 'agent_user_1',
              email: 'agent@rolloutctrl.local',
              isAgent: true,
            },
          };
          req.mcpApiKey = {
            id: 'key_1',
            projectId: 'proj_1',
            projectSlug: 'proj-1',
            environmentId: null,
          };
          return true;
        },
      })
      .compile();

    controller = moduleRef.get(McpController);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  function mockReqRes(body?: unknown, user?: unknown, mcpApiKey?: unknown) {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      headersSent: false,
    };
    const req: any = { body, user, mcpApiKey };
    return { req, res };
  }

  it('rejects requests with no authenticated user', async () => {
    const { req, res } = mockReqRes({}); // no user/mcpApiKey

    await controller.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(factory.create).not.toHaveBeenCalled();
  });

  it('creates a per-request MCP server with user + scope and forwards the request', async () => {
    const { req, res } = mockReqRes(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2025-11-25', capabilities: {} },
      },
      { user: { id: 'agent_user_1', isAgent: true } },
      { projectId: 'proj_1', projectSlug: 'proj-1', environmentId: null },
    );

    await controller.handle(req, res);

    // Factory invoked with the authenticated user + scope.
    expect(factory.create).toHaveBeenCalledTimes(1);
    const ctx = factory.create.mock.calls[0][0];
    expect(ctx.user.id).toBe('agent_user_1');
    expect(ctx.scope).toEqual({
      projectId: 'proj_1',
      projectSlug: 'proj-1',
      environmentId: null,
    });

    // Transport.handleRequest called with req, res, parsed body.
    expect(handleRequest).toHaveBeenCalledWith(req, res, req.body);

    // Server closed after handling (resource release).
    expect(serverClose).toHaveBeenCalledTimes(1);
  });

  it('responds 500 and still closes the server when the transport throws', async () => {
    handleRequest.mockRejectedValueOnce(new Error('transport boom'));

    const { req, res } = mockReqRes(
      { method: 'initialize' },
      { user: { id: 'agent_user_1' } },
      { projectId: 'proj_1', projectSlug: 'proj-1', environmentId: null },
    );

    await controller.handle(req, res);

    // Transport error is converted to a 500 response (headers not sent yet).
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'MCP request failed' });

    // Server still closed (resource release in finally).
    expect(serverClose).toHaveBeenCalledTimes(1);
  });
});
