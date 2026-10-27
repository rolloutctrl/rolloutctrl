# RolloutCtrl MCP — Guide for AI Agents

RolloutCtrl exposes a **Model Context Protocol (MCP)** server so external AI
agents can safely manage feature flags, rollout strategies, variants,
segments, and access actions by reusing the existing NestJS business logic,
validation, authorization, and audit trail.

This document is the end-user guide for connecting an MCP client and using the
available tools. For the internal architecture see
[`MCP_ARCHITECTURE.md`](./MCP_ARCHITECTURE.md).

---

## 1. Endpoint

| Item | Value |
|---|---|
| Transport | Streamable HTTP (stateless) |
| URL | `https://<your-host>/mcp` |
| Method | `POST` (JSON-RPC 2.0 envelope) |
| Protocol version | `2025-11-25` |

The MCP endpoint lives at the root path `/mcp`.

A fresh MCP server instance is created per request (stateless mode). No
session id is required; each request carries its own API key.

---

## 2. Authentication

MCP uses **AGENT API keys** — a dedicated API key type distinct from the
existing `CLIENT` and `SERVER` SDK keys.

### 2.1 Creating an AGENT key

1. Sign in to the RolloutCtrl dashboard as a project owner/admin.
2. Open **Project → API Keys → Create key**.
3. Select type **AGENT**.
4. The key is automatically scoped to the project it is created in — the
   agent can only access that project's resources through MCP.
5. (Optional) Pin the key to a single **environment** (`environmentId`).
   When pinned, the agent can only operate within that environment.
6. Save the key. The raw key is shown **once** in the format
   `rctrl-agent-<hex>`. Store it securely — it cannot be recovered later.

Creating an AGENT key automatically provisions a dedicated **agent user**
(`isAgent: true`, `email = agent[N]@rolloutctrl.local`) that is added as a
`DEVELOPER` member of the project the key belongs to. This agent user is the **audit
actor** for all MCP operations.

### 2.2 Connecting

Send the API key in the `x-api-key` HTTP header on every request:

```
x-api-key: rctrl-agent-<hex>
```

The key is hashed (SHA-256) and looked up. Only keys with `type = AGENT` and
`revokedAt = null` are accepted. `CLIENT`/`SERVER` keys are rejected.

### 2.3 Revoking / rotating a key

Revoke an AGENT key from the dashboard (**Project → API Keys → Revoke**) or
via the REST API:

```
PATCH /api/projects/:projectId/api-keys/:keyId/revoke
```

Revocation sets `revokedAt` and immediately blocks all subsequent MCP
requests with that key. To rotate:

1. Create a new AGENT key.
2. Update the MCP client configuration with the new key.
3. Revoke the old key.

There is no automatic rotation; rotate on a schedule appropriate to your
security policy.

---

## 3. Authorization model

Every MCP request enforces, in order:

1. **Authentication** — valid, non-revoked AGENT key with an active agent user.
2. **Permission allowlist** — a fixed set of permissions granted to AGENT
   keys. Delete and administrative operations are **not** in the allowlist and
   cannot be invoked through MCP.
3. **Project scope** — the requested `projectId` (id or slug) must match the
   key's project. Cross-project or cross-organization access is rejected.
4. **Environment scope** — if the key is pinned to an environment, the
   requested `environmentId` must match.
5. **Domain service validation** — the underlying NestJS service re-validates
   ownership, uniqueness, and business rules (defense in depth).

### 3.1 What is prohibited via MCP

- **No delete operations** — `delete_flag`, `delete_strategy`,
  `delete_variant`, `delete_segment`, `delete_action` are not registered.
- **No `archived` field on `update_flag`** — archiving is an administrative
  operation exposed only via the management UI/REST API. The MCP handler
  strips `archived` even if an agent sends it.
- **No organization / project / user / API-key management** — creating or
  modifying organizations, projects, users, or API keys is not exposed.
- **No arbitrary HTTP** — MCP tools call existing services only.

---

## 4. Tools

29 tools are available: 16 read-only and 13 mutation. All mutation tools have
`destructiveHint: false`.

### 4.1 Read-only tools

| Tool | Description | Required permission |
|---|---|---|
| `list_flags` | List all flags in a project | `FLAG_READ` |
| `get_flag` | Get a single flag by id | `FLAG_READ` |
| `get_flag_config` | Get flag config for one environment | `FLAG_READ` |
| `get_flag_all_configs` | Get flag config for all environments | `FLAG_READ` |
| `list_environments` | List environments in a project | `ENV_READ` |
| `get_environment` | Get one environment | `ENV_READ` |
| `list_strategies` | List strategies for flag environments | `FLAG_STRATEGY_READ` |
| `get_strategy` | Get one strategy | `FLAG_STRATEGY_READ` |
| `list_strategy_variants` | List variants attached to a strategy | `FLAG_STRATEGY_READ` |
| `list_variants` | List variants for a flag | `VARIANT_READ` |
| `get_variant` | Get one variant | `VARIANT_READ` |
| `list_segments` | List segments in a project | `SEGMENT_READ` |
| `get_segment` | Get one segment | `SEGMENT_READ` |
| `list_actions` | List actions in a project | `ACTION_READ` |
| `get_action` | Get one action | `ACTION_READ` |
| `list_flag_actions` | Audit history for a flag | `AUDIT_READ` |

### 4.2 Mutation tools

| Tool | Description | Required permission |
|---|---|---|
| `create_flag` | Create a single flag (key + description) | `FLAG_CREATE` |
| `update_flag` | Update flag key/description (`archived` is stripped) | `FLAG_UPDATE` |
| `enable_flag` | Enable a flag in an environment (supports `dryRun`) | `FLAG_TOGGLE` |
| `disable_flag` | Disable a flag in an environment (supports `dryRun`) | `FLAG_TOGGLE` |
| `create_strategy` | Create a strategy (rollout, segments, rules, schedule) | `FLAG_STRATEGY_CREATE` |
| `update_strategy` | Update a strategy (covers rollout + targeting) | `FLAG_STRATEGY_UPDATE` |
| `toggle_strategy` | Enable/disable a strategy | `FLAG_STRATEGY_TOGGLE` |
| `create_variant` | Create a variant for a flag | `VARIANT_CREATE` |
| `update_variant` | Update a variant | `VARIANT_UPDATE` |
| `create_segment` | Create a segment with rules | `SEGMENT_CREATE` |
| `update_segment` | Update a segment (key, name, rules) | `SEGMENT_UPDATE` |
| `create_action` | Create an access action with strategies | `ACTION_CREATE` |
| `update_action` | Update an action | `ACTION_UPDATE` |

### 4.3 Tool parameters

Each tool accepts a JSON object of arguments. Common arguments:

| Argument | Type | Description |
|---|---|---|
| `projectId` | string | Project id or slug (required on most tools) |
| `flagId` | string | Feature flag id |
| `environmentId` | string | Environment id |
| `strategyId` | string | Strategy id |
| `variantId` | string | Variant id |
| `segmentId` | string | Segment id |
| `actionId` | string | Action id |
| `dryRun` | boolean | Preview without applying (enable/disable flag only) |

Tool-specific arguments mirror the REST DTOs (e.g. `key`, `description`,
`rolloutPercentage`, `rolloutStickinessField`, `segmentIds`, `rules`,
`name`, `colorTag`, `payload`, `payloadType`). See the tool's
`inputSchema` (returned by `tools/list`) for the exact contract.

---

## 5. Production safety: dry-run

`enable_flag` and `disable_flag` accept `dryRun: true` to preview a change
without applying it. This is recommended for **production** environments.

**Dry-run response:**
```json
{
  "wouldApply": true,
  "enabled": true,
  "isProduction": true,
  "message": "Preview: flag would be ENABLED in production. Re-run with dryRun: false (or omit it) to apply."
}
```

Dry-run is a defense-in-depth layer: the agent cannot bypass server-side
validation by omitting `dryRun` — the actual mutation still goes through the
full service validation pipeline.

---

## 6. Audit

Every MCP tool invocation is recorded in the `AuditLog` table with:

- **Tool name** (e.g. `create_flag`)
- **Agent user id** (audit actor)
- **Project id** and **organization id** (scope)
- **Success/failure** and error message (if any)
- **Duration** and **timestamp**

The audit payload **never** contains tool arguments or service responses, so
secrets (API keys, payloads) cannot leak into the audit log. Domain services
additionally write their own business-level audit entries (e.g.
`AuditAction.CREATE` for a new flag).

---

## 7. Retry and idempotency

- **Read-only tools** are safe to retry.
- **Mutation tools** are **not** automatically retried by the MCP server. The
  MCP client is responsible for retry policy.
- Most mutation tools are idempotent by argument (e.g. `enable_flag` with the
  same `enabled` value), but `create_*` tools are **not** idempotent —
  re-invoking `create_flag` with the same `key` returns a `ConflictException`.
- Do **not** auto-retry mutation tools without confirming idempotency, as a
  partially-applied operation may leave the system in an inconsistent state.

---

## 8. Client configuration examples

### 8.1 Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "rolloutctrl": {
      "url": "https://rolloutctrl.example.com/mcp",
      "headers": {
        "x-api-key": "rctrl-agent-<hex>"
      }
    }
  }
}
```

### 8.2 Cursor / generic Streamable HTTP client

```json
{
  "mcpServers": {
    "rolloutctrl": {
      "transport": "streamable-http",
      "url": "https://rolloutctrl.example.com/mcp",
      "headers": {
        "x-api-key": "rctrl-agent-<hex>"
      }
    }
  }
}
```

### 8.3 Custom client (raw HTTP)

```bash
# 1. Initialize
curl -X POST https://rolloutctrl.example.com/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: rctrl-agent-<hex>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-11-25",
      "capabilities": {},
      "clientInfo": { "name": "my-agent", "version": "1.0.0" }
    }
  }'

# 2. List tools
curl -X POST https://rolloutctrl.example.com/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: rctrl-agent-<hex>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'

# 3. Call a tool
curl -X POST https://rolloutctrl.example.com/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: rctrl-agent-<hex>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "list_flags",
      "arguments": { "projectId": "my-project" }
    }
  }'
```

---

## 9. Typical workflows

### 9.1 View an existing flag

```json
{ "name": "get_flag", "arguments": { "projectId": "my-project", "flagId": "flag_123" } }
```

To see the flag's configuration across all environments:

```json
{ "name": "get_flag_all_configs", "arguments": { "projectId": "my-project", "flagId": "flag_123" } }
```

### 9.2 Create a flag

```json
{
  "name": "create_flag",
  "arguments": {
    "projectId": "my-project",
    "key": "new-checkout-flow",
    "description": "Enables the redesigned checkout flow"
  }
}
```

The flag is created **disabled** in all existing environments.

### 9.3 Add a variant

```json
{
  "name": "create_variant",
  "arguments": {
    "projectId": "my-project",
    "featureFlagId": "flag_123",
    "name": "Variant B",
    "colorTag": "green",
    "payloadType": "STRING",
    "payload": "variant-b"
  }
}
```

> `payload` and `payloadType` must be provided together (or both omitted).

### 9.4 Configure a gradual rollout

Create a strategy with a rollout percentage and stickiness field:

```json
{
  "name": "create_strategy",
  "arguments": {
    "projectId": "my-project",
    "featureFlagEnvironmentIds": ["ffe_123"],
    "rolloutPercentage": 25,
    "rolloutStickinessField": "userId",
    "name": "25% rollout"
  }
}
```

To change the percentage later:

```json
{
  "name": "update_strategy",
  "arguments": {
    "projectId": "my-project",
    "strategyId": "strat_123",
    "rolloutPercentage": 50,
    "rolloutStickinessField": "userId"
  }
}
```

> `rolloutStickinessField` is required whenever `rolloutPercentage` is set.

### 9.5 Disable a flag

First, preview the change in production:

```json
{
  "name": "disable_flag",
  "arguments": {
    "projectId": "my-project",
    "flagId": "flag_123",
    "environmentId": "env_production",
    "dryRun": true
  }
}
```

Then apply it:

```json
{
  "name": "disable_flag",
  "arguments": {
    "projectId": "my-project",
    "flagId": "flag_123",
    "environmentId": "env_production"
  }
}
```

---

## 10. Environment variables & deployment

MCP reuses the existing RolloutCtrl deployment — no new infrastructure is
required. The MCP endpoint runs in the same NestJS process on port 3000.

### 10.1 Relevant environment variables

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection (shared with the app) |
| `REDIS_HOST` / `REDIS_PORT` | — | Redis for cache invalidation (shared) |
| `ALLOWED_ORIGINS` | — | CORS origins for the dashboard/API. MCP uses `x-api-key`, not CORS, so no special CORS entry is needed for MCP clients. |

No MCP-specific environment variables are required.

### 10.2 Docker

The existing `docker-compose.yml` / `docker-compose.selfhost.yml` /
`docker-compose.dev.yml` require **no changes** — MCP is part of the main
NestJS image and listens on the same port (3000). Ensure your reverse proxy
or load balancer routes `/mcp` to the backend container.

### 10.3 Reverse proxy example (nginx)

```nginx
location /mcp {
  proxy_pass http://rolloutctrl-backend:3000;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header x-api-key $http_x_api_key;
  proxy_set_header Content-Type $http_content_type;
  proxy_buffering off;   # Streamable HTTP may keep connections open
  proxy_read_timeout 300s;
}
```

---

## 11. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | Missing/invalid/revoked AGENT key | Check `x-api-key` header; create a new AGENT key |
| `403 Forbidden` (McpToolError) | Permission or scope check failed | Verify the key's `projectId`/`environmentId` covers the requested resource |
| `404 Not Found` on `/api/mcp` | Old path | Use `/mcp` (no `/api` prefix) |
| `ConflictException` on `create_*` | Duplicate key/name | Use a unique `key`/`name` |
| Tool not in `tools/list` | Not registered or name typo | Check the tool name against section 4 |

