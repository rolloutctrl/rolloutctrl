# Contributing to RolloutCtrl

First of all, thank you for your interest in contributing to RolloutCtrl! ❤️

Whether you're fixing a bug, improving the documentation, or implementing a new feature, your contribution is greatly appreciated.

## Before You Start

- Search existing issues before creating a new one.
- For large features or breaking changes, please open an issue first to discuss the proposal.
- Keep pull requests focused on a single change whenever possible.

## Development Setup

### Prerequisites

- Node.js 24+
- yarn
- Docker & Docker Compose

### Clone the repository

```bash
git clone https://github.com/rolloutctrl/rolloutctrl.git
cd rolloutctrl
```

### Install dependencies

```bash
yarn install
```

### Start development environment

```bash
docker compose up -d
```

Run the application:

Backend

```bash
yarn start:dev
```

Frontend

```bash
cd frontend
yarn dev
```

## Project structure

```
rolloutctrl/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Seed script
│   └── migrations/         # Migration history
├── src/                    # NestJS backend
│   ├── common/             # Constants, decorators, guards, generated Prisma
│   ├── config/             # Redis & CORS config
│   ├── modules/            # Feature modules (auth, project, feature-flag, ...)
│   ├── app.module.ts
│   └── main.ts             # Entry point (port 3000, prefix /api)
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── app/            # Router, providers
│   │   ├── entities/       # API entities
│   │   ├── features/       # Feature-sliced UI components
│   │   ├── pages/          # Route pages
│   │   ├── shared/         # Shared lib, hooks, UI
│   │   └── widgets/        # Composite widgets
│   └── nginx.conf          # Production Nginx config
├── docker-compose.yml          # Dev: PostgreSQL + Redis only
├── docker-compose.selfhost.yml # Self-host: full stack
├── Dockerfile              # Backend Docker image
└── package.json
```

## Branch Naming

Please use descriptive branch names.

Examples:

```
feature/add-node-sdk
feature/strategy-variants

fix/cache-invalidation
fix/sdk-bootstrap

docs/update-readme
```

## Commit Messages

RolloutCtrl follows the Conventional Commits specification.

Examples:

```text
feat: add node sdk

fix: resolve evaluator cache issue

docs: update installation guide

refactor: simplify strategy evaluator

test: add evaluator unit tests

chore: update dependencies
```

## Coding Guidelines

- Write clean, readable, and maintainable code.
- Follow the existing code style.
- Prefer small, focused pull requests.
- Avoid introducing unrelated changes.
- Keep public APIs backward compatible whenever possible.

## Pull Requests

Before submitting a pull request, please ensure that:

- The project builds successfully.
- All tests pass.
- New functionality includes appropriate tests.
- Documentation has been updated if necessary.
- Your pull request has a clear description explaining the motivation and implementation.

## Reporting Bugs

When reporting a bug, please include:

- RolloutCtrl version
- Operating system
- Node.js version
- Steps to reproduce
- Expected behavior
- Actual behavior

## Feature Requests

Feature requests are welcome.

Please describe:

- The problem you're trying to solve.
- Your proposed solution.
- Possible alternatives.
- Any additional context.

## Documentation

Documentation improvements are always welcome.

This includes:

- README
- SDK documentation
- Examples
- API documentation
- Tutorials

## Questions

If you have questions about contributing, feel free to open a GitHub Discussion or create an issue.

Thank you for helping make RolloutCtrl better! 🚀