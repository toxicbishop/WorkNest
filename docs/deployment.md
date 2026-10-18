# WorkNest CRM — Production Deployment & Operations Guide

This guide describes how to configure, harden, and deploy WorkNest CRM in production environments.

---

## 1. System Architecture

```mermaid
flowchart TD
    Client["Browser / Client Apps"] -->|"HTTPS :443"| Proxy["Reverse Proxy (Nginx / Cloudflare / Caddy)"]
    Proxy -->|"HTTP :3000"| NextApp["Next.js App Router (Node.js 20+)"]
    Proxy -->|"HTTP /api/v1"| FastAPI["FastAPI Backend (Uvicorn / Gunicorn)"]
    FastAPI -->|"TCP :5432 (SSL)"| Postgres[("PostgreSQL 15+ Database")]
    FastAPI -->|"Background Workers"| Sched["Periodic Task Scheduler"]
```

### Application Boundary
- **Next.js:** Server-side rendering, client presentation, and UI routing.
- **FastAPI:** Authoritative business logic, validation, JWT authentication, booking conflict prevention, and GST invoicing.
- **PostgreSQL:** Relational data storage with ACID guarantees and database-level constraints.

---

## 2. Environment Variables Checklist

### Frontend (`.env.production` or platform secrets)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Public endpoint of the FastAPI backend service | `https://api.worknest.space/api/v1` |
| `NODE_ENV` | Runtime environment | `production` |

> [!CAUTION]
> Never put database passwords, JWT secrets, or administrative API keys in `NEXT_PUBLIC_` variables. They are compiled into the client bundle and visible to anyone inspecting the page.

### Backend (`server/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string with SSL | `postgresql+psycopg2://user:secret@db.internal:5432/worknest_prod?sslmode=require` |
| `SECRET_KEY` | Cryptographically secure secret for JWT signing | Generate with `openssl rand -hex 32` |
| `ALGORITHM` | JWT cryptographic algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `1440` (24 hours) |
| `BACKEND_CORS_ORIGINS` | Permitted frontend origins | `["https://app.worknest.space"]` |

---

## 3. Containerized Deployment (Docker & Compose)

### Dockerfile for Backend (`server/Dockerfile`)

```dockerfile
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt pyproject.toml ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Dockerfile for Frontend (`Dockerfile.web`)

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

### Docker Compose (`docker-compose.prod.yml`)

```yaml
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: worknest_prod
      POSTGRES_USER: worknest_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U worknest_admin -d worknest_prod"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    restart: always
    environment:
      DATABASE_URL: postgresql+psycopg2://worknest_admin:${DB_PASSWORD}@db:5432/worknest_prod
      SECRET_KEY: ${BACKEND_SECRET_KEY}
      BACKEND_CORS_ORIGINS: '["https://worknest.space"]'
    depends_on:
      db:
        condition: service_healthy
    command: >
      sh -c "alembic upgrade head &&
             python -m app.db.seed &&
             uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.web
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: https://api.worknest.space/api/v1
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

---

## 4. Database Migrations in CI/CD

Before starting updated backend containers, run pending migrations:

```bash
cd server
alembic upgrade head
```

Roll back a failed migration:
```bash
alembic downgrade -1
```

---

## 5. Security & Hardening Controls

1. **HTTP Security Headers:**
   Next.js is configured with strict security headers in [`next.config.ts`](file:///d:/Code/Repo/WorkNest/next.config.ts):
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: origin-when-cross-origin`
2. **Password Security:**
   All user passwords are encrypted using `bcrypt` with unique salts.
3. **Database Concurrency:**
   Booking overlap prevention queries are enforced directly at the database layer to eliminate race conditions under concurrent requests.
4. **Monetary Safety:**
   Financial minor units (cents/paise) prevent floating-point rounding drift on GST invoices.

---

## 6. Backups & Disaster Recovery

### Automated PostgreSQL Backup Cron
```bash
# Run daily at 02:00 AM
0 2 * * * pg_dump -U worknest_admin -h localhost worknest_prod | gzip > /backups/worknest_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

### Restore Procedure
```bash
gunzip < /backups/worknest_20261018_020000.sql.gz | psql -U worknest_admin -d worknest_prod
```
