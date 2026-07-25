# RolloutCtrl Frontend

**React dashboard for RolloutCtrl** — manage feature flags, rollout strategies, environments, segments, variants, access control, and project members from a single web interface.

---

## What is this?

The frontend is the web dashboard for the RolloutCtrl feature flag and rollout platform. It provides a modern interface for development teams to:

- **Manage feature flags** across projects and environments
- **Configure rollout strategies** with targeting rules and percentage rollouts
- **Run A/B tests** with feature variants and weighted assignments
- **Organize projects** with environments, segments, and team members
- **Control access** with actions, roles, and permissions
- **Monitor activity** through metrics and audit logs
- **Generate SDK API keys** for application integrations

The dashboard communicates with the RolloutCtrl NestJS API through the `/api` endpoint.

## Dashboard

The application is built as a single-page React dashboard with authenticated routes for global settings and project management.

Available sections include:

- Home and organization settings
- Project overview and project settings
- Feature flags, strategies, and variants
- Actions and access control rules
- Environments and user segments
- API keys and audit logs
- User, role, and permission management

## Get started in 5 minutes

### Prerequisites

- **Node.js** 22+
- **Yarn** 1.x
- A running RolloutCtrl API — by default at `http://localhost:3000`

### 1. Install dependencies

From the repository root:

```bash
cd frontend
yarn install
```

### 2. Start the development server

```bash
yarn dev
```

The dashboard is available at `http://localhost:5173`.

The Vite development server proxies `/api` requests to `http://localhost:3000` by default. Start the backend separately from the repository root:

```bash
yarn start:dev
```

### 3. Configure the API URL

To use a backend running at another URL, create a local environment file:

```bash
VITE_API_URL=http://localhost:3000
```

The `VITE_API_URL` value is used as the proxy target during development. In the production Docker image it is set to `/api`, so Nginx serves the dashboard and proxies API requests through the same origin.

## Available commands

| Command          | Description                                      |
| ---------------- | ------------------------------------------------ |
| `yarn dev`       | Start the Vite development server                |
| `yarn build`     | Type-check and create a production build        |
| `yarn lint`      | Run ESLint                                       |
| `yarn preview`   | Preview the production build locally             |

## Production Docker build

The frontend includes a multi-stage Dockerfile that builds the application with Node.js and serves the generated assets with Nginx.

```bash
docker build -t rolloutctrl-frontend .
docker run --rm -p 8080:80 rolloutctrl-frontend
```

The dashboard is then available at `http://localhost:8080`. In the full self-hosted setup, use the root project's Docker Compose configuration instead:

```bash
cp ../.env.selfhost.example ../.env
docker compose -f ../docker-compose.selfhost.yml up -d --build
```

## Project structure

```text
frontend/
├── src/
│   ├── app/          # Application providers and routing
│   ├── entities/     # API entities and entity-level UI
│   ├── features/     # User actions and feature modules
│   ├── pages/        # Route-level pages
│   ├── shared/       # Shared API clients, hooks, types, and UI
│   └── widgets/      # Composite dashboard widgets
├── public/           # Static public assets
├── Dockerfile        # Production multi-stage Docker build
├── nginx.conf        # Nginx static hosting and API proxy config
├── package.json      # Scripts and dependencies
└── vite.config.ts    # Vite, React, Tailwind, and API proxy config
```

The codebase follows a feature-sliced structure. Routing and application providers live in `src/app`, reusable domain models live in `src/entities`, user interactions live in `src/features`, and larger composed interface blocks live in `src/widgets`.

## Tech stack

- **Framework:** React 19, TypeScript
- **Build tool:** Vite 8
- **UI:** Mantine, Tailwind CSS, Tabler Icons
- **Data fetching:** TanStack Query, Axios
- **Forms and validation:** Formik, Yup
- **Routing:** React Router
- **State management:** Zustand
- **Charts:** Recharts, Mantine Charts
- **Production server:** Nginx

## Related documentation

- [RolloutCtrl](../README.md) — product overview and full-stack setup
- [Installation](../docs/installation.md) — local development environment
- [Feature Flags](../docs/feature-flags.md) — flags, strategies, segments, and variants
- [API Reference](../docs/api.md) — management and SDK endpoints
- [Contributing Guide](../CONTRIBUTING.md) — contribution workflow and project conventions
