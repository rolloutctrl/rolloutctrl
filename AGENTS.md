# AGENTS.md

## Test Commands

- **Run all tests (no coverage):** `npx jest --no-coverage`
- **Run all tests with coverage:** `npx jest --coverage`
- **Run a single spec:** `npx jest src/modules/strategy/strategy.service.spec.ts --no-coverage`

## Test Architecture

- Testing helpers live in `src/common/testing/`:
  - `mock-prisma.ts` — `createMockPrismaService()` factory that auto-chains `mockResolvedValue`/`mockResolvedValueOnce` for every Prisma model.
  - `mock-redis.ts` — `createMockRedis()` returns a `MockRedis` with `get`/`set`/`del` jest mocks.
  - `mock-config.ts` — `createMockConfigService()` for `ConfigService` DI.
- All specs use `Test.createTestingModule` from `@nestjs/testing` and inject mock providers.
- The `moduleNameMapper` in `package.json` maps `^src/(.*)$` → `<rootDir>/$1` so specs can import helpers via `src/common/testing/...`.

## Coverage Gates

Per-file thresholds are configured in `package.json` under `jest.coverageThreshold`:

| Module | Stmts | Branches | Funcs | Lines |
|---|---|---|---|---|
| access.service | 80 | 50 | 60 | 80 |
| access.utils | 95 | 90 | 100 | 95 |
| auth.service | 85 | 60 | 90 | 85 |
| jwt.strategy | 95 | 80 | 90 | 95 |
| jwt-refresh-token.strategy | 90 | 80 | 70 | 90 |
| feature-flag.service | 95 | 75 | 95 | 95 |
| strategy.service | 70 | 50 | 70 | 70 |
| sdk.service | 75 | 30 | 60 | 80 |
| sdk guards (all 3) | 95 | 90 | 100 | 95 |

Global threshold is set to 0 (per-file gates enforce quality; global is a floor to prevent total regressions).

## Tested Modules (Priority 1)

1. `access.service` — `can`, `evaluateFlag`, Redis cache, cache invalidation.
2. `access.utils` — permission matching helpers.
3. `auth.service` — JWT/refresh token generation, bcrypt hashing, OAuth profile handling.
4. `jwt.strategy` / `jwt-refresh-token.strategy` — Passport JWT validation.
5. `feature-flag.service` — CRUD, status transitions, targeting rules, environment scoping.
6. `strategy.service` — CRUD, rules (operators/fields validation), segments, variants, weight redistribution, audit logging.
7. `sdk.service` — `getConfig` (cache hit/miss), `getConfigChanges`, `trackEvaluations`, cache invalidation.
8. `sdk-key.guard` — API key hashing (sha256), DB lookup, request attachment.
9. `sdk-origin.guard` — CLIENT key type enforcement, origin matching (exact + wildcard).
10. `sdk-server.guard` — SERVER key type enforcement.

## Untested Modules (Priority 2+)

- `project.service`, `api-key.service`
- `segment.service`
- `organization.service`
- `user.service`
- `variant.service`
- All controllers (HTTP layer)
- `sdk-server.service`
