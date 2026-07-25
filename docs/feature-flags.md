# Feature Flags

Feature flags (also called feature toggles) are the core concept of
RolloutCtrl. They allow you to control which users see which features,
without deploying new code.

## Core concepts

### Feature Flag

A feature flag is identified by a **key** (e.g. `new-dashboard`) within a
project. A flag is created once, then configured **per environment**.

### Environment

Each project has environments (e.g. `development`, `production`). A flag can
be enabled in one environment and disabled in another. Each
flag-environment combination is a `FeatureFlagEnvironment` with its own:

- `enabled` state (on/off)
- Strategies (targeting rules)
- Variants (A/B testing)

### Strategy

A strategy defines **who** gets the flag. A flag-environment can have
multiple strategies, evaluated by priority. The first matching strategy wins.

Strategy properties:

| Property | Description |
| --- | --- |
| `name` | Human-readable name |
| `enabled` | Whether the strategy is active |
| `priority` | Evaluation order (lower = higher priority) |
| `matchType` | `ALL` (all rules must match) or `ANY` (any rule matches) |
| `rolloutPercentage` | Percentage of users who get the flag (0-100) |
| `rolloutStickinessField` | Field used for consistent hashing (e.g. `userId`) |
| `startsAt` / `endsAt` | Schedule window (optional) |
| `timezone` | Timezone for schedule (optional) |
| `rules` | Inline targeting rules |
| `segments` | Reusable targeting segments |
| `strategyVariants` | Variants with weights for A/B testing |

### Strategy Rule

A rule is a single condition: `field` + `operator` + `value`.

```json
{
  "field": "country",
  "operator": "IN",
  "value": ["US", "CA", "GB"],
  "not": false
}
```

### Operators

| Operator | Description | Example value |
| --- | --- | --- |
| `EQUALS` | Exact match | `"premium"` |
| `IN` | Value is in array | `["US", "CA", "GB"]` |
| `INCLUDES` | Array/string includes value | `"admin"` |
| `GT` | Greater than | `100` |
| `LT` | Less than | `50` |
| `GTE` | Greater than or equal | `18` |
| `LTE` | Less than or equal | `65` |
| `CONTAINS` | String contains substring | `"@test.com"` |
| `STARTS_WITH` | String starts with | `"user_"` |
| `ENDS_WITH` | String ends with | `".com"` |

All operators support the `not` flag to negate the condition.

### Segment

A segment is a **reusable** set of rules that can be shared across multiple
strategies and flags. For example, a "Test Users" segment with an email
domain rule can be attached to any strategy.

### Variant

A variant is a named configuration option for A/B testing. Each variant has:

| Property | Description |
| --- | --- |
| `name` | Variant name (e.g. `control`, `treatment`) |
| `payloadType` | `STRING`, `NUMBER`, `BOOLEAN`, or `JSON` |
| `payload` | The payload value |
| `colorTag` | Visual color tag for the UI |

Variants are assigned to strategies with **weights** (e.g. 50/50 split).

## Evaluation flow

```
1. Flag disabled for environment?
   └─ YES → return { enabled: false, reason: FLAG_DISABLED }

2. No strategies defined?
   └─ YES → return { enabled: true, reason: NO_STRATEGIES }

3. Evaluate strategies in priority order:
   ├─ Strategy disabled? → skip
   ├─ Check schedule window (startsAt/endsAt) → skip if outside window
   ├─ Evaluate rules (with matchType ALL/ANY)
   ├─ Evaluate segments
   ├─ Check rollout percentage (if set)
   └─ First matching strategy wins
       ├─ Has variants? → assign variant by weight → return variant
       └─ No variants? → return { enabled: true, strategy }

4. No strategy matched?
   └─ return { enabled: false, reason: NO_STRATEGY_MATCH }
```

## Evaluation context

When evaluating a flag, you provide a **context** with user attributes:

```typescript
const context = {
  userId: 'user_123',       // used for stickiness/rollout hashing
  kind: 'user',             // entity kind (default: 'user')
  key: 'user_123',          // unique key for hashing (defaults to userId)
  // custom attributes — used by strategy rules
  country: 'US',
  subscription: 'premium',
  email: 'user@test.com',
  betaTester: false,
};
```

## Rollout percentage & stickiness

When a strategy has a `rolloutPercentage` (e.g. 25%), only that percentage of
users will match. To ensure the **same user** always gets the same result,
the SDK uses a hash of the `rolloutStickinessField` (typically `userId`).

```
hash(userId) % 100 < rolloutPercentage → user gets the flag
```

This provides **consistent bucketing** — a user who gets the flag will always
get it (until the percentage is increased or the flag is disabled).

## Variants & A/B testing

When a strategy has variants with weights, the matched user is assigned a
variant based on the weights:

```json
"strategyVariants": [
  { "weight": 50, "variant": { "name": "control", "payload": "old-ui" } },
  { "weight": 50, "variant": { "name": "treatment", "payload": "new-ui" } }
]
```

The variant assignment is also **sticky** — the same user always gets the
same variant (based on hash of the stickiness field).

## Scheduled rollouts

Strategies can be time-bound using `startsAt` and `endsAt` with an optional
`timezone`:

- If current time is before `startsAt` → strategy doesn't match
- If current time is after `endsAt` → strategy doesn't match
- Timezone is used to interpret the schedule in the user's local time

## Example: Gradual rollout

**Scenario**: Roll out `new-dashboard` to 25% of premium users in US, CA, GB,
excluding beta testers.

Strategy configuration:

```json
{
  "name": "Gradual Rollout",
  "enabled": true,
  "priority": 1,
  "matchType": "ALL",
  "rolloutPercentage": 25,
  "rolloutStickinessField": "userId",
  "rules": [
    { "field": "subscription", "operator": "EQUALS", "value": "premium" },
    { "field": "country", "operator": "IN", "value": ["US", "CA", "GB"] },
    { "field": "betaTester", "operator": "EQUALS", "value": "true", "not": true }
  ]
}
```

## Example: Segment-based targeting

**Scenario**: Enable flag for all test users (email contains `@test.com`).

1. Create a segment `test-users` with rule:
   ```json
   { "field": "email", "operator": "CONTAINS", "value": "@test.com" }
   ```

2. Create a strategy and attach the segment.

3. The segment can now be reused across other flags without redefining rules.

## Actions (access control)

Actions are similar to feature flags but return `ALLOW` or `DENY` instead of
enabled/disabled. They are used for fine-grained authorization.

```json
{
  "key": "user.edit",
  "defaultEffect": "DENY",
  "strategies": [
    {
      "effect": "ALLOW",
      "matchType": "ANY",
      "rules": [
        { "field": "role", "operator": "EQUALS", "value": "admin" },
        { "field": "role", "operator": "EQUALS", "value": "manager" }
      ]
    }
  ]
}
```

Evaluation: if any strategy matches and returns `ALLOW`, the action is allowed.
If no strategy matches, the `defaultEffect` is returned.

## Caching

RolloutCtrl uses Redis for two layers of caching:

| Cache | Key prefix | TTL | Purpose |
| --- | --- | --- | --- |
| Access config | `access:config:` | 3600s (1h) | Server-side evaluation config |
| SDK config | `sdk-config:` | no expiry | SDK client config |

Both caches are **invalidated automatically** when flags, strategies, segments,
or actions are modified. You can also manually clear caches via:

```http
POST /api/access/cache/clear
```

## Metrics

RolloutCtrl tracks three types of metrics:

| Type | Description |
| --- | --- |
| `FLAG_EXPOSURE` | Total flag evaluations |
| `STRATEGY_MATCH` | How often each strategy matched |
| `VARIANT_EXPOSURE` | How often each variant was assigned |

Metrics are aggregated into daily buckets and viewable in the dashboard.
The SDK can report metrics via `POST /api/sdk/client/evaluations`.
