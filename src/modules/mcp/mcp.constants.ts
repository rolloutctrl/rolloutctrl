/**
 * MCP endpoint path (mounted at `/mcp`, excluded from the global `/api` prefix
 * in main.ts via `setGlobalPrefix('api', { exclude: ['mcp'] })`).
 *
 * The Streamable HTTP transport accepts POST requests at this path.
 */
export const MCP_ENDPOINT_PATH = 'mcp';

/**
 * MCP server identity advertised to clients during `initialize`.
 */
export const MCP_SERVER_INFO = {
  name: 'rolloutctrl-mcp',
  version: '1.0.0',
} as const;
