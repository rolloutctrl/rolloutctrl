# Installation (Local Development)

This guide covers setting up RolloutCtrl for local development.

## Prerequisites

- **Node.js** 24+ (backend) / 22+ (frontend)
- **Yarn** 1.x (Classic)
- **PostgreSQL** 18+
- **Redis** 7+

## 1. Clone the repository

```bash
git clone <repo-url> rolloutctrl
cd rolloutctrl
```

## 2. Start PostgreSQL and Redis

The easiest way is to use the dev Docker Compose file, which starts only the
database and Redis (no application containers):

```bash
docker compose up -d
```

This starts:

- **PostgreSQL** on `localhost:5432` (user: `postgres`, password: `postgres`, db: `rolloutctrl`)
- **Redis** on `localhost:6379`

Alternatively, you can run PostgreSQL and Redis natively or via any other method.

## 3. Configure environment variables

Create a `.env` file in the project root:

```bash
cp .env.selfhost.example .env
```

Then edit `.env` and add the database URL:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rolloutctrl
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT secrets — change in production!
JWT_ACCESS_TOKEN_SECRET=dev-access-secret-change-me
JWT_REFRESH_TOKEN_SECRET=dev-refresh-secret-change-me

# Token expiration
JWT_ACCESS_TOKEN_EXPIRATION_TIME=15m
JWT_REFRESH_TOKEN_EXPIRATION_TIME=7d

# Bcrypt salt rounds
USER_PASSWORD_SALT_ROUNDS=5

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080
```

## 4. Install backend dependencies

```bash
yarn install
```

## 5. Run database migrations and seed

```bash
# Apply migrations and generate Prisma client
yarn migrate:dev

# Seed the database with sample data
yarn prisma:seed
```

The seed creates:

- **Organization**: "My Organization"
- **Owner user**: `admin@rolloutctrl.local` / password: `@Rollout123`
- **Project**: "Main Project" (slug: `main-project`)
- **Environments**: `development`, `production`
- **Feature flag**: `new-dashboard` with strategies and segments
- **Action**: `user.edit` with allow rules for `admin` and `manager` roles

## 6. Start the backend

```bash
# Development mode with hot reload
yarn start:dev
```

The API is available at `http://localhost:3000/api`.

## 7. Start the frontend

```bash
cd frontend
yarn install
yarn dev
```

The frontend is available at `http://localhost:5173`.

## Default login credentials

| Field    | Value                    |
| -------- | ------------------------ |
| Email    | `admin@rolloutctrl.local`|
| Password | `@Rollout123`            |

## Useful scripts

| Script | Description |
| --- | --- |
| `yarn start:dev` | Start backend in watch mode |
| `yarn build` | Build backend for production |
| `yarn start:prod` | Run built backend (`node dist/main`) |
| `yarn migrate:dev` | Apply migrations + generate Prisma client |
| `yarn migrate:dev:create` | Create a new migration without applying |
| `yarn migrate:deploy` | Apply pending migrations (production) |
| `yarn prisma:generate` | Regenerate Prisma client |
| `yarn prisma:studio` | Open Prisma Studio (DB GUI) |
| `yarn prisma:seed` | Seed the database |
| `yarn lint` | Run ESLint with auto-fix |
| `yarn format` | Run Prettier |
| `yarn test` | Run unit tests (Jest) |
| `yarn test:e2e` | Run e2e tests |

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
