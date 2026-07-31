# Changelog

All notable changes to this project will be documented in this file.

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
