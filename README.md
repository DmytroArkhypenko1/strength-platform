# Strength Platform

A full-stack strength-training platform focused on structured workout planning, workout logging, and future computer-vision research for exercise technique analysis.

## Current status

The backend API is actively developed and tested. The web and mobile clients, nutrition features, rule-based recommendations, email OTP authentication, and computer-vision service are planned next stages.

### Implemented

- NestJS REST API with TypeScript
- MySQL 8.4 database running in Docker
- Prisma ORM, migrations, generated client, and separate test database
- Email/password registration and JWT authentication
- User profile and body-weight tracking
- Canonical exercise library
- Workout-plan management:
  - plans, training days, exercises, and planned sets
  - reordering days and exercises
  - editing and deleting plans, days, exercises, and planned sets
- Workout-session tracking:
  - create sessions from a plan day or manually
  - log, edit, and delete completed sets
  - complete a session and preserve workout history
  - prevent changes to completed sessions
- Ownership checks preventing access to another user's plans or sessions
- End-to-end tests for authorization, validation, completed-session immutability, and workout-history preservation

### Planned

- React/Vite web interface
- React Native / Expo mobile client
- Email verification and multi-factor authentication with OTP/TOTP
- Rule-based training recommendations
- Nutrition tracking and calorie/macronutrient targets
- Python/FastAPI computer-vision service for exercise-technique research
- AI-assisted recommendations

## Architecture

```text
apps/
  api/       NestJS REST API
  web/       Planned React/Vite client
  mobile/    Planned React Native/Expo client

services/
  vision/    Planned Python/FastAPI computer-vision service

packages/
  shared/    Planned shared TypeScript types and schemas

infra/
  docker-compose.yml
```

## Backend stack

- TypeScript
- NestJS
- Prisma ORM
- MySQL 8.4
- Docker Compose
- JWT authentication
- Vitest and Supertest for end-to-end testing
- pnpm workspace

## Getting started

### Prerequisites

- Node.js
- pnpm
- Docker Desktop

### Install dependencies

```bash
pnpm install
```

### Configure environment variables

Create `apps/api/.env`:

```env
DATABASE_URL="mysql://<user>:<password>@127.0.0.1:3307/strength_platform"
SHADOW_DATABASE_URL="mysql://<user>:<password>@127.0.0.1:3307/strength_platform_shadow"
JWT_SECRET="<replace-with-a-long-random-secret>"
```

### Start MySQL

```bash
docker compose -f infra/docker-compose.yml up -d
```

### Apply migrations and generate Prisma Client

```bash
pnpm --filter api exec prisma migrate deploy
pnpm --filter api exec prisma generate
```

### Start the API

```bash
pnpm --filter api start:dev
```

The API runs on:

```text
http://localhost:3000
```

## Quality checks

```bash
pnpm --filter api build
pnpm --filter api lint
```

## End-to-end tests

E2E tests use a separate MySQL database named `strength_platform_test`.

Create `apps/api/.env.test` with test database credentials, then run:

```powershell
$env:DOTENV_CONFIG_PATH = ".env.test"
pnpm --filter api test:e2e
```

## API capabilities

| Area | Available functionality |
|---|---|
| Authentication | Registration, login, JWT-protected endpoints |
| Profile | Read and update the current user's profile |
| Weight | Create and list body-weight records |
| Exercises | Browse the canonical exercise library |
| Workout plans | Create, read, update, reorder, activate, and delete plans |
| Plan days | Create, edit, reorder, and delete days |
| Plan exercises | Add, edit, reorder, and delete exercises |
| Planned sets | Add, edit, and delete individual planned sets |
| Workout sessions | Create, list, read, complete, and protect sessions |
| Workout sets | Record, edit, delete, and validate actual completed sets |

## Security decisions

- User IDs are taken from JWT claims, not request bodies.
- Nested resources are checked against the authenticated owner.
- Completed sessions are immutable.
- Unique database constraints prevent duplicate ordering and duplicate set numbers.
- E2E tests verify authorization and validation behavior.

## Research direction

The planned research component will investigate whether computer vision can identify predefined exercise-technique deviations from recorded workout videos under different recording conditions.

The vision service is planned and is not yet implemented.