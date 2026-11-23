# Environments & environment variables

| Env | `NODE_ENV` | Database | Secrets come from |
|---|---|---|---|
| Local dev | `development` | Docker Postgres (`localhost:5433`) | `backend/.env` (copied from `.env.example`) |
| CI | `test` | CI service container | workflow `env:` / GitHub secrets |
| Staging | `staging` | staging DB | hosting provider's secret manager |
| Production | `production` | production DB | hosting provider's secret manager |

## Local setup
```bash
docker compose -f infra/docker/docker-compose.dev.yml up -d postgres
cp .env.example backend/.env
cd backend && npx prisma db push && npm run start:dev
```
Check it: `curl localhost:3000/health`.

## Rules
- `.env.example` is the single list of variables; add every new variable there.
- Never commit `.env`, `.env.staging`, `.env.production` (git-ignored).
- Load order: real environment variables > `.env.<NODE_ENV>` > `.env`.
- The app **fails at startup** (`src/config/env.validation.ts`) if `DATABASE_URL` or the JWT secrets are
  missing; in staging/production the JWT secrets must be >= 32 chars, not `change_me` placeholders,
  and different from each other. Generate with `openssl rand -base64 48`.
- Staging and production must use separate databases and separate secrets.
