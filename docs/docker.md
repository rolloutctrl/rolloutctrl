# Docker Deployment

RolloutCtrl ships with two Docker Compose configurations:

| File | Purpose |
| --- | --- |
| `docker-compose.yml` | **Development** — starts only PostgreSQL and Redis |
| `docker-compose.selfhost.yml` | **Self-host / Production** — full stack (DB, Redis, backend, frontend) |

## Development stack (databases only)

Used for local development. Starts PostgreSQL 18 and Redis 7 with persistent
volumes and health checks.

```bash
docker compose up -d
```

Services:

- **rolloutctrl-postgres** — `localhost:5432`
- **rolloutctrl-redis** — `localhost:6379`

## Full self-host deployment

Builds and runs the entire application stack in Docker.

### 1. Prepare environment

```bash
cp .env.selfhost.example .env
```

Edit `.env` — **change JWT secrets** for production:

```env
JWT_ACCESS_TOKEN_SECRET=<your-strong-secret>
JWT_REFRESH_TOKEN_SECRET=<your-strong-secret>
JWT_ACCESS_TOKEN_EXPIRATION_TIME=15m
JWT_REFRESH_TOKEN_EXPIRATION_TIME=7d
USER_PASSWORD_SALT_ROUNDS=10
ALLOWED_ORIGINS=https://your-domain.com
```

### 2. Start the stack

```bash
docker compose -f docker-compose.selfhost.yml up -d --build
```

### Services

| Service | Container | Port | Description |
| --- | --- | --- | --- |
| PostgreSQL | `rolloutctrl-postgres` | internal | Database (Postgres 18 Alpine) |
| Redis | `rolloutctrl-redis` | internal | Cache + BullMQ queue (Redis 7 Alpine) |
| Backend | `rollout-backend` | `3000` | NestJS API |
| Frontend | `rollout-frontend` | `8080` | Nginx serving React SPA + API proxy |

All services communicate over a `rolloutctrl-internal` bridge network. Only
the backend (port 3000) and frontend (port 8080) are exposed to the host.

### 3. Access the application

- **Frontend**: `http://localhost:8080`
- **API**: `http://localhost:8080/api` (proxied via Nginx) or `http://localhost:3000/api` (direct)

### Default credentials

After the first startup, the `init-db.sh` entrypoint script automatically:

1. Waits for PostgreSQL to be ready
2. Applies Prisma migrations (`prisma migrate deploy`)
3. Seeds the database if empty

| Field    | Value                     |
| -------- | ------------------------- |
| Email    | `admin@rolloutctrl.local` |
| Password | `@Rollout123`             |

**Change the default password immediately after first login.**

## Architecture

```
                    ┌──────────────────┐
                    │   Frontend (80)  │
                    │  Nginx + React   │
                    └────────┬─────────┘
                             │ /api proxy
                    ┌────────▼─────────┐
                    │  Backend (3000)  │
                    │  NestJS API      │
                    └───┬──────────┬───┘
                        │          │
              ┌─────────▼──┐  ┌───▼────────┐
              │ PostgreSQL │  │   Redis    │
              │   (5432)   │  │   (6379)   │
              └────────────┘  └────────────┘
```

## Dockerfiles

### Backend (`/Dockerfile`)

Multi-stage build:

1. **Builder** — `node:24-alpine`, installs deps, generates Prisma client, builds NestJS
2. **Runner** — `node:24-alpine`, runs `init-db.sh` then `node dist/main`

### Frontend (`/frontend/Dockerfile`)

Multi-stage build:

1. **Builder** — `node:22-alpine`, builds Vite SPA with `VITE_API_URL=/api`
2. **Runner** — `nginx:alpine`, serves static files + proxies `/api` to backend

## Environment variables reference

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://postgres:postgres@rolloutctrl-postgres:5432/rolloutctrl` | PostgreSQL connection string |
| `REDIS_HOST` | `rolloutctrl-redis` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `JWT_ACCESS_TOKEN_SECRET` | `dev-access-secret-change-me` | JWT access token signing secret |
| `JWT_REFRESH_TOKEN_SECRET` | `dev-refresh-secret-change-me` | JWT refresh token signing secret |
| `JWT_ACCESS_TOKEN_EXPIRATION_TIME` | `15m` | Access token TTL |
| `JWT_REFRESH_TOKEN_EXPIRATION_TIME` | `7d` | Refresh token TTL |
| `USER_PASSWORD_SALT_ROUNDS` | `5` | Bcrypt salt rounds |
| `ALLOWED_ORIGINS` | `http://localhost:8080,http://localhost:5173` | Comma-separated CORS origins |
| `NODE_ENV` | `production` | Node environment |

## Managing the deployment

```bash
# View logs
docker compose -f docker-compose.selfhost.yml logs -f

# Restart a service
docker compose -f docker-compose.selfhost.yml restart rollout-backend

# Stop everything
docker compose -f docker-compose.selfhost.yml down

# Stop and remove volumes (⚠️ deletes all data)
docker compose -f docker-compose.selfhost.yml down -v
```
