# Venture ERP contributor guide

## Repository layout

- `venture-erp-backend/`: Java 21, Spring Boot, Maven, JPA, and PostgreSQL REST API. Business code is grouped by feature under `src/main/java/br/com/venture/ventureflow/`.
- `venture-erp-frontend/`: React and TypeScript single-page application built with Vite. UI code is grouped under `src/features/`; shared application layout is under `src/app/`.
- `docs/PROJECT_CONTEXT.md`: detailed, evidence-based architecture and current implementation status.

Do not commit generated `target/`, `dist/`, or `node_modules/` content, or local environment/secret files.

## Commands

Run commands from the named subdirectory.

### Backend (`venture-erp-backend`)

- Run: `.\mvnw.cmd spring-boot:run`
- Test: `.\mvnw.cmd test`
- Build: `.\mvnw.cmd clean package`
- Required runtime variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`; optional `PORT` (default `8080`) and `FRONTEND_URL` (default `http://localhost:5173`).

### Frontend (`venture-erp-frontend`)

- Install: `npm ci`
- Run: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Preview production build: `npm run preview`
- Optional runtime/build variable: `VITE_API_URL`; when omitted locally, Vite proxies `/api` to `http://localhost:8080`.

The frontend currently has no automated test script.

## Existing conventions

- Backend: package by feature; controllers delegate to services, services use Spring Data repositories, and Java records define request/response DTOs. Classes use `PascalCase`, methods/fields `camelCase`, database tables/columns `snake_case`, and constructor injection.
- Frontend: feature folders contain `api`, `components`, `pages`, and `types`; components/pages use `PascalCase`, functions and variables `camelCase`, and type-only imports use `import type`. API calls use `fetch` and read the base URL from `VITE_API_URL`.
- Keep entities out of public API contracts; preserve DTO mapping methods such as `Response.from(entity)`.
- Add validation at API boundaries and keep transaction boundaries in services.
- Security is fail-closed: every route requires `ADMIN` by default in `SecurityConfig`. Granting another role access requires an explicit carve-out above `anyRequest`, and that carve-out ships in the same commit as the page that consumes it—never earlier. See `PROJECT_CONTEXT.md`.

See [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) before changing domain behavior, API contracts, persistence, or deployment configuration.
