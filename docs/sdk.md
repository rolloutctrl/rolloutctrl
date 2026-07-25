# SDK

RolloutCtrl provides two types of SDK endpoints and corresponding client
libraries: **Client SDK** (browser) and **Server SDK** (backend).

## SDK endpoints

| Type | Base path | Guards | API key type |
| --- | --- | --- | --- |
| Client | `/api/sdk/client` | `SdkKeyGuard` + `SdkOriginGuard` | `CLIENT` |
| Server | `/api/sdk/server` | `SdkKeyGuard` + `SdkServerGuard` | `SERVER` |

Both expose the same three operations:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/config?environment=...` | Fetch full environment config |
| `GET` | `/config/changes?environment=...&since=N` | Check if config version changed |
| `POST` | `/evaluations` | Report evaluation metrics in batch |

## Client SDK

For browser-based applications (React, Vue, vanilla JS). Uses a **CLIENT**
API key with origin-based CORS protection.

| Language / Framework | Package | Repository |
| --- | --- | --- |
| Evaluator JS / TS | `@rolloutctrl/evaluator` | [github.com](https://github.com/rolloutctrl/js-core/tree/main/packages/evaluator), [npmjs.com](https://www.npmjs.com/package/@rolloutctrl/evaluator) |
| JavaScript / TypeScript | `@rolloutctrl/js-sdk` | [github.com](https://github.com/rolloutctrl/js-core/tree/main/packages/sdk/js-sdk), [npmjs.com](https://www.npmjs.com/package/@rolloutctrl/js-sdk) |
| React | `@rolloutctrl/react-sdk` | [github.com](https://github.com/rolloutctrl/js-core/tree/main/packages/sdk/react-sdk), [npmjs.com](https://www.npmjs.com/package/@rolloutctrl/react-sdk) |
| React SSR | `in process` | – |
| Vue | `in process` | – |

### Client API key

- Read-only access to flag configs and metric reporting
- `allowedOrigins` enforced via `Origin` header (supports wildcards, e.g. `*.example.com`)
- Cannot access management API endpoints

## Server SDK

For server-side applications (Node.js, Python, Go, etc.). Uses a **SERVER**
API key with no origin restriction.

| Language | Package | Repository |
| --- | --- | --- |
| Node.js | `@rolloutctrl/node-sdk` | [github.com](https://github.com/rolloutctrl/js-core/tree/main/packages/sdk/node-sdk), [npmjs.com](https://www.npmjs.com/package/@rolloutctrl/node-sdk) |
| Python | `in process` | – |
| Go | `in process` | – |

### Server API key

- Read-only access to flag configs and metric reporting
- No origin check — safe to use in backend services
- Cannot access management API endpoints

## How it works

All SDKs use a **config polling** architecture:

1. Fetch the full environment config from the API
2. Cache it locally (in memory or `localStorage`)
3. All flag/action evaluations happen locally — sub-millisecond latency
4. Periodically poll for config changes and re-fetch if needed

No network call is needed per evaluation.

## Evaluation

### Feature flags

```typescript
import { evaluateFeatureFlag, type EvaluationContext } from '@rolloutctrl/evaluator';

const flag = config.flags['new-dashboard'];

const context: EvaluationContext = {
  userId: 'user_123',
  kind: 'user',
  key: 'user_123',
  country: 'US',
  subscription: 'premium',
};

const result = evaluateFeatureFlag(flag, context);

console.log(result.enabled);  // true | false
console.log(result.reason);    // EvaluationReason
console.log(result.strategy);  // { id, name } if matched
console.log(result.variant);   // { id, name, payload, payloadType } if variant assigned
```

### Actions (access control)

```typescript
import { evaluateAction } from '@rolloutctrl/evaluator';

const action = config.actions['user.edit'];

const result = evaluateAction(action, { role: 'admin' });

console.log(result.effect);     // 'ALLOW' | 'DENY'
console.log(result.strategyId); // ID of matching strategy, or null (default effect)
```

### Evaluation reasons

| Reason | Description |
| --- | --- |
| `DISABLED_FLAG` | Flag is disabled for this environment |
| `NO_STRATEGIES` | Flag enabled but has no strategies (returns enabled) |
| `NO_STRATEGY_MATCH` | No strategy matched the context |
| `STRATEGY_MATCH` | A strategy matched (with or without variant) |

## Tracking metrics

```http
POST /api/sdk/server/evaluations
Header: x-api-key: <your-server-api-key>
Content-Type: application/json

{
  "evaluations": [
    {
      "type": "FLAG_EXPOSURE",
      "count": 1,
      "featureFlagEnvironmentId": "...",
      "featureFlagId": "...",
      "strategyId": "...",
      "variantId": "..."
    }
  ]
}
```

| Metric type | Description |
| --- | --- |
| `FLAG_EXPOSURE` | Flag was evaluated (regardless of result) |
| `STRATEGY_MATCH` | A specific strategy matched |
| `VARIANT_EXPOSURE` | A specific variant was assigned |
