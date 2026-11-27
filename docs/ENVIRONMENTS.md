# Environments & environment variables

| Env | `NODE_ENV` | Database | Secrets come from |
|---|---|---|---|
| Local dev | `development` | Docker Postgres (`localhost:5433`) | `backend/.env` (copied from `.env.example`) |
| CI | unset (Jest uses `test`) | CI service container | workflow `env:` |
| Staging | `staging` | staging DB | hosting provider's secret manager |
| Production | `production` | production DB | hosting provider's secret manager |

## Local setup
```bash
docker compose -f infra/docker/docker-compose.dev.yml up -d postgres
cp .env.example backend/.env
npm ci
cd backend && npx prisma migrate deploy && npx prisma generate && npm run start:dev
```
Check it: `curl localhost:3000/health`.

If your database was created earlier with `prisma db push`, `migrate deploy` refuses to run on it
(error P3005). Mark the initial migration as already applied, once:
`npx prisma migrate resolve --applied 20261113121304_init`.

After changing `schema.prisma`, run `npm run prisma:migrate` in `backend/` and commit the new migration.

## CI
`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`: install, apply migrations
and check they match the schema, lint, type check, unit and e2e tests, build. It needs no GitHub secrets.
Deployment is not set up yet.

Run the same checks locally from the repository root:
```bash
npm ci
(cd backend && npx prisma generate)
npm run lint --workspaces
npm run typecheck --workspaces
npm test --workspaces
npm run test:e2e --workspace backend
npm run build --workspaces
```

## Rules
- `.env.example` is the single list of variables; add every new variable there.
- Never commit `.env`, `.env.staging`, `.env.production` (git-ignored).
- Load order: real environment variables > `.env.<NODE_ENV>` > `.env`.
- The app **fails at startup** (`src/config/env.validation.ts`) if `DATABASE_URL` or the JWT secrets are
  missing; in staging/production the JWT secrets must be >= 32 chars, not `change_me` placeholders,
  and different from each other. Generate with `openssl rand -base64 48`.
- Staging and production must use separate databases and separate secrets.
