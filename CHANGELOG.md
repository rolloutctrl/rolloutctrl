# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-09-21

### Added

* Added mobile responsive layout for the admin panel.
* Added shared `PassportModule` configuration in `AuthModule`.
* Marked `AuthModule` as `@Global()` and exported the registered `PassportModule` so `AuthModuleOptions` is available across modules using authentication guards.

### Changed

* Upgraded backend dependencies to NestJS 12.
* Upgraded Prisma and Prisma PostgreSQL adapter to 7.10.
* Upgraded BullMQ to 6.3.
* Upgraded Jest to 30 and related testing dependencies.
* Upgraded ESLint and TypeScript ESLint packages.
* Updated SWC dependencies:

  * `@swc/core` `^1.16.1`
  * `@swc/jest` `^0.2.39`
* Updated various backend runtime and development dependencies.

### Testing

* Switched Jest transformer from `ts-jest` to `@swc/jest`.
* Added `.swcrc` configuration for SWC.
* Configured Jest `transformIgnorePatterns` to allow transformation of ESM packages from `node_modules`:

```text
node_modules/(?!(@nestjs|@dicebear)/)
```

This is required because NestJS 12 packages use ESM (`"type": "module"`), while SWC handles the conversion of `import.meta` to CommonJS for Jest.


## [1.1.0] - 2026-08-04

### Added
- Per-user rate limiting for the admin API via a global `AdminThrottlerGuard` (`APP_GUARD`). Default limit: 240 req/min per authenticated user (falls back to IP for unauthenticated routes). Returns a JSON 429 response (`error`, `retry_after`, `message`) consistent with the rest of the API
- Stricter throttle on `POST /auth/login`: 10 attempts/min per IP to mitigate brute-force
- `IoRedisThrottlerStorage` — custom `ThrottlerStorage` implementation for ioredis (atomic Lua script with `evalsha` + `NOSCRIPT` fallback). Replaces `@nestjs-redis/throttler-storage`, which is incompatible with ioredis v5 (`client.scriptLoad` does not exist)

### Changed
- `AccessController.evaluate` now resolves `projectId` from the API key (`resolveProjectIdFromApiKey`) instead of accepting it in the request body

### Removed
- `@nestjs-redis/throttler-storage` dependency (incompatible with ioredis v5)
- `POST /access/cache/clear` endpoint (commented out)
- Leftover `console.log` statements in `ProjectPage` and `StrategyItem`

### Fixed
- `TypeError: this.client.scriptLoad is not a function` — runtime error caused by `@nestjs-redis/throttler-storage` targeting `node-redis` instead of `ioredis`
- Jest warning "A worker process has failed to exit gracefully" — added `moduleRef.close()` in `afterEach` across all service specs and enabled `forceExit` in the Jest config

## [1.0.1] - 2026-07-31

### Fixed
- Default strategies now always get priority `0`; existing strategies in the environment are re-sequenced (`1, 2, ...`) on creation to guarantee the default stays lowest and to compact gaps left by deletions

### Removed
- Dead commented-out code and the unused `useCreateStrategyForm` hook in Create/Edit strategy features
- `incremental` option from `tsconfig.json`

### Chores
- Ignore `*.tsbuildinfo` in `.dockerignore`

## [1.0.0] - 2026-07-27

### Added
- Initial public release
