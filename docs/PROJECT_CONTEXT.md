# Venture ERP — Project Context

This document describes the repository as inspected on 2026-08-18. It distinguishes implemented behavior from inferred intent. “Needs confirmation” marks facts that cannot be established from the repository. The code is the source of truth when older plans or comments disagree with runtime behavior.

## 1. Project purpose and current scope

Venture ERP is an early ERP for a factory and its reseller network. The usable application currently covers:

- authenticated access for factory administrators, reseller administrators, and assembly supervisors;
- sales-order creation, role-scoped listing, editing, assignment to an assembly supervisor, soft deletion, and restoration;
- reseller administration with create, list, edit, soft delete, and restore flows;
- inventory item and category administration, including category assignment, aliases, quantity replacement, soft deletion, and restoration;
- backend account administration, including role/reseller assignment and password changes. There is no user-administration frontend yet.

The central business boundary is the sales order. Every order belongs to one reseller and may optionally be assigned to an active assembly supervisor from that same reseller. Authentication identifies the caller, and the backend derives order visibility from the authenticated principal rather than accepting scope from the browser.

### Still incomplete or uncertain

- The legacy `Product` model/service still exists beside the newer `Item`/`Category` inventory model. `ProductController` is empty, while items and categories are the exposed inventory API. Whether `Product` will be removed or migrated is **Needs confirmation**.
- `CreatePartRequestPage` and `ResellerPartRequestPage` remain empty; the intended part-request workflow is **Needs confirmation**.
- Whether a reseller is always the commercial customer, or is a distinct party in a broader customer model, is **Needs confirmation**.
- There is no pagination, sales-order detail page, audit log, or frontend user-administration page.

## 2. Technology stack

| Area | Technology | Repository evidence |
|---|---|---|
| Backend | Java 21, Spring Boot 4.1.0, Spring MVC, Spring Data JPA, Validation, Security | `venture-erp-backend/pom.xml` |
| Authentication | Stateless bearer JWT signed with HS256 through JJWT 0.13.0; BCrypt password hashes | `auth/*`, `PasswordEncoderConfig.java`, `pom.xml` |
| Persistence | Hibernate/JPA with PostgreSQL; schema validation at startup | entities, repositories, `application.properties` |
| Migrations | Flyway with PostgreSQL support; migrations V1 through V4 | `pom.xml`, `src/main/resources/db/migration/` |
| Frontend | React 19.2.7, TypeScript 6.0.2, Vite 8.1.1 | `venture-erp-frontend/package.json` |
| Routing/UI | React Router; Floating UI for shared portal-based action menus | `App.tsx`, `ActionMenu.tsx` |
| Testing | One backend context-load test; no frontend test script | backend tests, frontend `package.json` |

The frontend declares `react-router-dom` 7.18.1 and a direct `react-router` 8.2.0 dependency. The major-version mismatch and need for the direct dependency remain **Needs confirmation**.

## 3. Repository structure

The root contains independently built backend and frontend applications plus shared project documentation.

```text
venture-erp/
├── docs/PROJECT_CONTEXT.md
├── venture-erp-backend/
│   └── src/main/
│       ├── java/br/com/venture/ventureflow/
│       │   ├── auth/
│       │   ├── config/
│       │   ├── inventory/
│       │   ├── reseller/
│       │   ├── salesorder/
│       │   ├── user/
│       │   └── shared/exception/
│       └── resources/db/migration/
└── venture-erp-frontend/
    └── src/
        ├── app/layout/
        ├── features/{auth,home,inventory,reseller,sales-orders}/
        ├── shared/{api,components}/
        └── styles/
```

Backend code is grouped primarily by feature, although inventory retains both a legacy direct-layer structure for `Product` and a newer `model/*` structure for items/categories. Frontend features contain their own pages, APIs, types, components, and styles. Generated `target/`, `dist/`, and `node_modules/` content and local secrets must not be committed.

## 4. Authentication and authorization

### Authentication flow

`POST /api/auth/login` is the only application endpoint explicitly open to anonymous callers. It normalizes the email, authenticates it through Spring Security, and returns a JWT plus the current user's identity, role, and optional reseller ID. Unknown email and wrong password both return an undifferentiated 401 to avoid account enumeration.

The JWT subject is the normalized email. `JwtAuthenticationFilter` reads `Authorization: Bearer <token>`, verifies signature and expiry, reloads the active user through `AppUserDetailsService`, and populates Spring's security context. Reloading the account means a deactivated user cannot continue using an otherwise unexpired token. Tokens themselves are stateless and have no server-side revocation list.

`GET /api/auth/me` lets the frontend validate a stored token and rebuild its user context. The browser stores the token in `localStorage`; the shared `apiFetch` attaches it to all feature requests. Any 401 clears the token and emits a shared event that signs the user out. Signing out is client-side token disposal, not server-side revocation.

Runtime authentication settings are `JWT_SECRET` (required, at least 32 characters) and `JWT_LIFETIME_SECONDS` (optional, default 28,800 seconds/eight hours).

### Roles and invariants

| Role | Account invariant | Sales-order visibility | Sales-order writes | Frontend navigation |
|---|---|---|---|---|
| `ADMIN` | Must not reference a reseller | All orders | Create, update, soft-delete, bulk soft-delete, restore | Home, sales orders, inventory, resellers |
| `RESELLER_ADMIN` | Must reference an active reseller | Orders belonging to the token's reseller once its API carve-out ships | None | **Gap:** absent from the frontend `UserRole` union and navigation map |
| `ASSEMBLY_SUPERVISOR` | Must reference an active reseller | Orders assigned to the authenticated user's ID once its API carve-out ships | None | Home |

User role/reseller invariants are enforced in `UserService`, not by a database check that can express the conditional association. Email is normalized to lowercase and unique; passwords are stored only as BCrypt hashes. User endpoints under `/api/users/**` are restricted to `ADMIN` by `SecurityConfig`.

### Authorization policy (fail-closed)

Authorization is deliberately fail-closed. `SecurityConfig` ends with `anyRequest().hasRole("ADMIN")`, so every route not listed explicitly requires `ADMIN`. A newly introduced role therefore receives no access until the product grants it deliberately; changing the fallback back to `authenticated()` would reopen application APIs merely because a caller can sign in.

The current application carve-outs are `/api/auth/login`, which is public, and `/api/auth/me`, which accepts any authenticated user. The latter is required for session restoration on browser reload; without it, a non-admin with a valid token would receive an authorization failure and be signed out when the application rebuilds its auth context.

Access for a non-admin role is coupled to its consumer: the carve-out and the page that uses it ship in the same commit, with the carve-out positioned above `anyRequest`. Opening an API earlier would expose surface for which the application has no legitimate consumer yet.

Frontend pages are separated by capability rather than by role: pages that offer writes are available only to roles with write permission, while read-only roles receive distinct views with no CRUD controls in the DOM. `SalesOrderPage` is therefore the current administrative view, restricted to `ADMIN`; future supervisor and reseller views will be separate read-only pages backed by the scoped `GET /api/sales-orders`, and must not be folded back into the administrative page through role-based conditionals.

The sales-order read scope is the living example of this separation. `SalesOrderService` already scopes `GET /api/sales-orders`, `GET /api/sales-orders/{id}`, and `GET /api/sales-orders/trash`: administrators see all matching orders, reseller administrators see their reseller's orders, and assembly supervisors see orders assigned to them. That service behavior is correct foundation rather than dead code, but the filter currently keeps those routes admin-only. Each non-admin role receives an explicit GET carve-out when its corresponding page ships.

Known authorization and session debts:

- There is no bootstrap path for the first `ADMIN`. Because `/api/users/**` is admin-only and the repository has neither a seeder nor versioned data SQL, a clean installation cannot create its first administrator through application flows. This is especially relevant to the demo environment.
- Changing a user's password does not revoke access tokens already issued. Tokens are stateless and live for `JWT_LIFETIME_SECONDS`, which defaults to 28,800 seconds (approximately eight hours). Setting `active=false` is the only immediate kill switch because the authentication filter reloads only active users on every request.

### Order visibility and write enforcement

Order scope is derived from `AppUserDetails`, whose user ID, role, and reseller ID came from the authenticated account. The client never supplies a visibility scope:

- `ADMIN`: repository queries all active or inactive orders;
- `RESELLER_ADMIN`: repository queries `reseller_id` from the authenticated principal;
- `ASSEMBLY_SUPERVISOR`: repository queries `assembly_supervisor_id` using the authenticated user's ID.

The same scope is applied to direct lookup, so requesting another party's order produces the same not-found result as a nonexistent ID. `SalesOrderService.requireWriteAccess` separately rejects all mutations unless the principal is `ADMIN`. The filter currently restricts the whole sales-order API to administrators; the service checks remain defense in depth and preserve the scope needed by future non-admin carve-outs. Browser route guards only hide UI and are never an authorization boundary.

## 5. Backend architecture

Controllers define HTTP contracts and delegate to feature services. Services enforce domain rules and map mutable JPA entities to record DTOs; entities are not public API contracts. Constructor injection is standard. The newer reseller, user, item, and category services declare transaction boundaries; sales-order writes mostly call repository `save` directly, while bulk deletion is explicitly transactional.

`SecurityConfig` uses stateless sessions, disables CSRF for the bearer-token API, permits CORS preflights, exposes `Location`, and allows one configured frontend origin. Any route not explicitly carved out requires `ADMIN`.

`GlobalExceptionHandler` currently maps JPA `EntityNotFoundException` to 404 and Bean Validation failures to 400. Several feature exceptions instead carry `@ResponseStatus` (notably 404, 409, and 422), while unannotated exceptions still rely on framework defaults. Error bodies and classification are therefore not centralized in one uniform contract.

### Inventory boundary

The active inventory implementation is no longer an empty placeholder:

- `/api/items` exposes create, active listing with optional category filters, get, update, code/alias lookup, quantity replacement, soft delete, trash listing, and restore;
- `/api/categories` exposes create, active/inactive listing, get, update, soft delete, and restore;
- the frontend supplies item list/create/edit/trash pages and a category administration page.

The separate legacy `Product` entity/service has no mapped controller and should not be treated as the active inventory contract.

## 6. Domain model and invariants

### Sales order

A `SalesOrder` has a unique generated code, name, optional description, status, creation timestamp, active flag, required reseller, and optional assembly supervisor. Public responses flatten reseller and supervisor relationships into IDs and names.

Important rules:

- the reseller must exist and be active when an order is created or updated;
- `assembly_supervisor_id` may be null, representing no factory assembly assignment;
- a non-null supervisor must be active, have role `ASSEMBLY_SUPERVISOR`, and belong to the order's reseller;
- only an `ADMIN` can assign or change a supervisor because only admins can create/update orders;
- when the reseller changes, the frontend immediately clears the selected supervisor and reloads options for the new reseller; the backend independently validates the submitted combination, so stale or forged IDs cannot cross reseller boundaries;
- status values are `CREATED`, `IN_PROGRESS`, `COMPLETED`, and `CANCELLED`; no transition matrix is enforced;
- soft deletion only changes `active`; it does not erase the row or change status.

Order codes are still generated as `repository.count() + 1` formatted as `PV-%02d`. This is not concurrency-safe and can collide after imports or physical row removal.

### Reseller

A reseller has name, CPF/CNPJ type and normalized digit-only document, active flag, and creation/update timestamps. Document number is globally unique. The backend validates presence and digit length; the frontend additionally validates CPF/CNPJ check digits and rejects repeated-digit documents before submission. Because client validation can be bypassed, full check-digit validation is not yet a backend invariant.

Reseller deletion is logical. The compact active listing (`id`, `name`) exists for selects, while administrative screens consume full records including document data, active state, and timestamps.

### User

A user is a credential/person acting for the factory or a reseller, not the reseller company itself. It has unique normalized email, BCrypt password hash, role, optional reseller association, active flag, and timestamps. Deactivation prevents authentication while preserving historical foreign-key references such as sales-order supervisor assignments.

### Inventory

Items have internal codes, descriptive data, measurement unit, quantity, active state, timestamps, categories, and optional source-specific aliases. Quantity changes use a dedicated endpoint rather than the general metadata update. Categories and items are soft-deleted. Detailed stock-ledger semantics, movements, reservations, and sales-order-line integration remain **Needs confirmation**.

## 7. API contract

All endpoints except login require a valid bearer token, and application endpoints are admin-only unless explicitly carved out. The table describes the main current surface; latent service-level scoping is noted separately from access currently granted by the filter.

| Method | Path | Purpose | Access |
|---|---|---|---|
| POST | `/api/auth/login` | Exchange credentials for JWT and user summary | Public |
| GET | `/api/auth/me` | Validate token and return current user | Authenticated |
| POST/GET/PUT/DELETE/PATCH | `/api/users/**` | Account CRUD/search, supervisor options, password, trash/restore | `ADMIN` |
| GET | `/api/resellers` | Active compact options (`id`, `name`) | `ADMIN` |
| GET | `/api/resellers/details` | Full active administrative list | `ADMIN` |
| POST, GET by ID, PUT, DELETE | `/api/resellers[/{id}]` | Create/read/update/soft-delete reseller | `ADMIN` |
| GET | `/api/resellers/trash` | Full inactive reseller list | `ADMIN` |
| POST | `/api/resellers/{id}/activate` | Restore reseller | `ADMIN` |
| POST | `/api/sales-orders` | Create order with optional supervisor | `ADMIN` |
| GET | `/api/sales-orders` | Active orders, newest first and principal-scoped | `ADMIN` currently; non-admin service scopes await page-coupled carve-outs |
| GET | `/api/sales-orders/{id}` | Principal-scoped order lookup | `ADMIN` currently; non-admin service scopes await page-coupled carve-outs |
| PUT/DELETE | `/api/sales-orders/{id}` | Update or soft-delete order | `ADMIN` |
| PATCH | `/api/sales-orders/{id}/activate` | Restore order | `ADMIN` |
| PATCH | `/api/sales-orders/bulk-soft-delete` | Atomically soft-delete IDs | `ADMIN`; no frontend client |
| GET | `/api/sales-orders/trash` | Inactive orders, principal-scoped | `ADMIN` currently; non-admin service scopes await page-coupled carve-outs |
| CRUD-like routes | `/api/items/**`, `/api/categories/**` | Inventory administration | `ADMIN` |

`GET /api/users/supervisors?resellerId=<id>` returns active `ASSEMBLY_SUPERVISOR` options (`id`, `name`) for one reseller and is used by both sales-order forms.

## 8. Main application flows

### Login and session restoration

The login page exchanges credentials for a token and stores it locally. On a browser reload, `AuthProvider` does not trust decoded client claims; it calls `/api/auth/me`. Invalid, expired, or deactivated sessions are cleared. `ProtectedRoute` redirects anonymous users to login and can limit pages by role, but backend enforcement remains mandatory.

### Create or update a sales order

Admin-only create/edit pages load active resellers. Selecting a reseller loads active assembly supervisors for that reseller. Both pages use a monotonically increasing request ID in `useRef`, so a slow response for an older reseller cannot overwrite the newest selection. Changing reseller clears the supervisor immediately; “Sem supervisor” submits `null`.

The backend repeats all authoritative checks: active reseller, admin write access, and active supervisor with the correct role and reseller. Create and update return `assemblySupervisorId` and `assemblySupervisorName` as nullable response fields.

### List orders

The current admin page calls `GET /api/sales-orders`. The backend retains principal-derived repository selection for the non-admin pages and filter carve-outs that will ship later. The desktop-oriented table shows code, name, reseller, status badge, creation date, and an ActionMenu. Status is hidden below 900px; essential columns retain a minimum width and the table container scrolls horizontally on narrower screens. The backend returns supervisor data, but the general list intentionally does not currently display it.

### Reseller administration

Admin frontend pages create, list, edit, deactivate, view trash, and restore resellers. The list uses `/details`; order forms use the compact `/api/resellers` response. Frontend CPF/CNPJ formatting and check-digit validation improve feedback, while backend normalization and uniqueness remain authoritative for persisted data.

## 9. Database schema and Flyway

Hibernate uses `spring.jpa.hibernate.ddl-auto=validate`: entity mappings are checked against the schema but do not mutate it. Flyway owns schema evolution, with migrations under `venture-erp-backend/src/main/resources/db/migration/`:

| Migration | Purpose |
|---|---|
| `V1__initial_schema.sql` | Baseline generated from the existing PostgreSQL schema (`pg_dump`), including categories, items, aliases, products, resellers, sales orders, and users |
| `V2__rename_employee_role_to_admin.sql` | Migrates `EMPLOYEE` to `ADMIN` and updates the user-role check |
| `V3__add_reseller_timestamps.sql` | Adds/backfills reseller creation and update timestamps |
| `V4__add_reseller_admin_role_and_supervisor.sql` | Adds `RESELLER_ADMIN` to the role check and nullable `sales_orders.assembly_supervisor_id` FK to users |

Flyway is enabled with `baseline-on-migrate=true` and baseline version 1. The baseline accommodates databases that predate Flyway, while new databases can be built from the migration history.

Operational rule: create and finish the complete migration file before starting the application. With DevTools/restarts, an empty versioned file can be discovered and recorded as an applied empty migration; filling that same version afterward then creates checksum/history problems rather than applying the intended SQL.

Core relational invariants include unique reseller document, unique user email, unique sales-order code, required sales-order reseller, and optional supervisor FK. The database role check permits `ADMIN`, `RESELLER_ADMIN`, and `ASSEMBLY_SUPERVISOR`; conditional reseller membership and supervisor/reseller compatibility remain service rules.

## 10. Frontend architecture and UI conventions

### State, API, and routing

Pages use local React state and effects; there is no query cache, global business store, or form library. Authentication is the exception: `AuthContext` holds the current session globally. All feature clients use shared `apiFetch`, which centralizes `VITE_API_URL`, bearer headers, and 401 handling; direct feature-level `fetch` is not the established pattern.

Routes use consistent feature paths such as `/sales-orders`, `/items`, and `/resellers`. Inventory, reseller, and sales-order pages are currently admin-only. There is no separate sales-order detail route.

### Navigation and actions

- `BackButton` implements hierarchical navigation with an explicit fixed destination. “Back” means moving to the known parent page, not browser history.
- `ActionMenu` is the shared three-dot menu for row/card actions. Floating UI provides offset, flip, shift, dismissal, and ARIA behavior; `FloatingPortal` prevents menus from being clipped by table or card containers.
- Primary buttons represent the page's principal commit/create action; secondary buttons represent cancellation, navigation, trash, or lower-emphasis actions.
- The sidebar is derived from role, while `ProtectedRoute` provides frontend route gating. Neither replaces backend authorization.

### Sales-order table

The sales-order list is a compact table rather than cards. Statuses are rendered as colored pills: neutral for created, blue for in progress, green for completed, and red for cancelled. At widths below 900px the secondary Status column is hidden; code, name, reseller, creation date, and actions remain. The table has a minimum width and horizontal scrolling so the rightmost ActionMenu stays reachable on very narrow screens.

## 11. Local and deployment environments

### Local

The known local workspace is `C:\WS\venture-erp`, outside OneDrive. This is an operational convenience, not an application invariant.

Backend runtime variables:

| Variable | Required | Purpose |
|---|---:|---|
| `DB_URL` | Yes | JDBC PostgreSQL URL |
| `DB_USERNAME` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | HS256 signing secret, at least 32 characters |
| `JWT_LIFETIME_SECONDS` | No | Token lifetime; defaults to 28,800 |
| `PORT` | No | HTTP port; defaults to 8080 |
| `FRONTEND_URL` | No locally | Allowed CORS origin; defaults to `http://localhost:5173` |

Frontend `VITE_API_URL` is optional locally. When absent, Vite proxies `/api` to `http://localhost:8080`.

Two workstation-specific command caveats are currently known:

- `mvnw.cmd` has a bootstrap defect in this checkout/environment; use an installed Maven only if available or repair/regenerate the wrapper before relying on it. The exact cross-machine impact is **Needs confirmation**.
- PowerShell policy blocks `npm.ps1`; use `npm.cmd` (for example, `npm.cmd run build`).

### Deployment

The Dockerfile and environment-driven configuration can support a container backend and PostgreSQL provider; Vite produces a static frontend. There is still no checked-in Render blueprint, frontend SPA rewrite configuration, Supabase project configuration, CI/CD workflow, or confirmed production topology. Actual hosting, PostgreSQL version, SSL/connection mode, regions, health checks, backups, custom domains, and deployment status are **Needs confirmation**.

## 12. Architectural decisions visible in code

| Decision | Why it matters | Current limitation |
|---|---|---|
| Stateless JWT with server-side user reload | Scales without HTTP sessions and deactivated accounts stop working | No token revocation before expiry; token is in localStorage |
| Fail-closed route authorization | New roles receive no API access accidentally | Non-admin access must ship through explicit page-coupled carve-outs |
| Principal-derived order scope | Prevents a client from choosing another reseller/user scope | Must be repeated for every future order query |
| Service-level admin check for order writes | Protects mutations even when UI controls are bypassed | Other admin modules do not yet repeat this backend role enforcement |
| Optional supervisor constrained to reseller | Prevents cross-reseller assignment and represents orders without factory assembly | Conditional rule is service-level, not a database constraint |
| DTOs separated from entities | Stabilizes public contracts and avoids exposing lazy JPA graphs | Mapping remains manual |
| Flyway plus `ddl-auto=validate` | Makes schema history reviewable and reproducible | Baseline contains pg_dump ownership details and rollback policy is unspecified |
| Soft deletion | Preserves recoverability and references | No deletion actor/time and some direct reads include inactive records |
| Shared `apiFetch`, `BackButton`, and `ActionMenu` | Centralizes auth transport and recurring interaction patterns | Error parsing and form/loading patterns remain partly duplicated |

## 13. Technical debt and risks

- **No first-admin bootstrap:** a clean installation cannot create its first administrator through an application flow; the demo environment needs an operational bootstrap mechanism.
- **Password changes do not revoke tokens:** an issued token remains usable until expiry unless the account is deactivated.
- **Incomplete reseller-admin frontend contract:** the backend and JWT response support `RESELLER_ADMIN`, but the frontend `UserRole` union and navigation map omit it. The role has no application page or API carve-out yet.
- **Count-based sales-order codes:** concurrent creates and unusual row histories can collide.
- **Minimal automated coverage:** one context-load backend test, no frontend tests, and no focused authorization/visibility tests.
- **Exception inconsistency:** the global advice does not provide one stable error envelope/status mapping for all feature exceptions and access failures.
- **Backend document validation gap:** CPF/CNPJ check digits are validated only in the frontend.
- **No pagination:** list endpoints load all matching records.
- **No auditability:** most domains lack actor/deletion metadata, optimistic versions, or audit history.
- **Legacy inventory overlap:** `Product` coexists with the active `Item` model without a documented migration/removal decision.
- **Status transitions unrestricted:** orders can move directly between any enum values.
- **Dependency mismatch:** direct React Router packages use different major versions.
- **Authentication initialization lint debt:** `AuthContext.tsx:43` calls `setState` synchronously in the session-initialization effect (`react-hooks/set-state-in-effect`). The fix changes the authentication initialization lifecycle and should be reviewed alongside a session-reload test rather than treated as mechanical cleanup.
- **Authentication Fast Refresh lint debt:** `AuthContext.tsx:110` exports `useAuth` from the same file as the provider (`react-refresh/only-export-components`). This is cosmetic and affects Fast Refresh rather than runtime behavior; resolve it by extracting the hook into its own module or suppressing the rule.
- **Floating UI callback-ref lint debt:** `ActionMenu.tsx:72` reports `refs.setFloating` as ref access during render (`react-hooks/refs`). This is likely a false positive for Floating UI's idiomatic callback-ref API; confirm that assessment and suppress the rule with a justification comment.
- **Multi-reseller model epic:** reseller representatives (`RESELLER_ADMIN`) and assembly supervisors (`ASSEMBLY_SUPERVISOR`) belong to multiple resellers, while the current singular `users.reseller_id` foreign key can represent only one. Addressing this requires a data-moving migration from `users.reseller_id` to a join table, changing `AppUserDetails` to expose multiple reseller IDs, and reviewing reseller-based permission scoping in `SalesOrderService`. Product decisions remain open on whether both roles share one join table or use role-specific relationships, whether multi-reseller visibility is aggregated or controlled by an active-reseller selector, and whether "represents" and "assembles for" describe the same association.
- **Role label versus technical identifier:** the UI displays "Representante de revenda", but the backend enum and frontend `UserRole` union retain the `RESELLER_ADMIN` identifier. Renaming the technical identifier, for example to `RESELLER_REP`, remains a cross-cutting refactor spanning the enum, a constraint/data migration, the frontend union, and every usage. It should be handled as a dedicated refactor separate from the multi-reseller epic.
- **User creation blocked on the multi-reseller model:** administrative creation of `RESELLER_ADMIN` and `ASSEMBLY_SUPERVISOR` users depends on the multi-reseller model because the form changes from a single reseller selection to a multi-select and the API request changes from `resellerId` to multiple IDs. User listing, trash, and password changes do not depend on that work and can be built first; implementing a single-select reseller field now would guarantee rework.
- **Generic filter builder (all modules):** list pages need a reusable filter modal where users choose an entity field, such as name, role, or entry date, and then enter or select a value appropriate to that field's type. This must serve every module rather than only users and requires dynamic-query support in the backend; `GET /api/users` currently filters only by `role` and `resellerId`, while text, enum, and date-range fields require different controls. Treat this as a dedicated epic for a later shared component.
- **Reusable table component (all modules):** table listings currently duplicate inline page markup and feature-specific CSS, as in `SalesOrderPage`. A shared component covering column definitions, cell rendering, responsive column hiding, and row keys would avoid reimplementing the pattern in every module. The users list will be the second consumer; extract the component once more than one consumer has consolidated the pattern.
- **User self-deactivation guard missing:** the users list allows an administrator to deactivate any account, including their own logged-in account, and the backend does not prevent it. No invariant stops self-deactivation or deactivation of the last active `ADMIN`, so either action could lock everyone out of the system. Enforcement belongs in the backend service, which should reject deactivation of the authenticated principal and of the last active administrator; the frontend may additionally hide the action for the current user as a secondary guard.
- **Deployment unspecified:** no CI/CD or provider-specific infrastructure/configuration is checked in.

## 14. Pending architecture decisions

- Confirm reseller/customer semantics and whether multi-tenancy extends beyond the current reseller scope.
- Define sales-order status transitions, cancellation semantics, numbering allocation, and whether inactive orders may be directly read.
- Define and ship the page-coupled read carve-outs for assembly-supervisor and reseller-admin sales-order views.
- Decide the intended `RESELLER_ADMIN` frontend navigation.
- Decide whether the legacy `Product` model is removed, migrated, or retained separately from items.
- Define inventory ledger, movements, reservations, and sales-order line relationships.
- Establish pagination/filter/search contracts and timestamp/time-zone policy.
- Standardize API error bodies and status mappings.
- Define migration rollback/repair procedures and review portability of the V1 pg_dump baseline.
- Confirm hosting topology, production PostgreSQL version, CI/CD, secrets, backups, observability, and disaster recovery.

## 15. Files an architect should inspect first

| File | Why it matters |
|---|---|
| `venture-erp-backend/src/main/java/br/com/venture/ventureflow/config/SecurityConfig.java` | Authentication boundary and route-level authorization |
| `venture-erp-backend/src/main/java/br/com/venture/ventureflow/auth/*` | JWT issuance, verification, principal construction, and login contracts |
| `venture-erp-backend/src/main/java/br/com/venture/ventureflow/salesorder/model/service/SalesOrderService.java` | Principal-derived visibility, admin writes, supervisor invariants, and order lifecycle |
| `venture-erp-backend/src/main/java/br/com/venture/ventureflow/salesorder/model/repository/SalesOrderRepository.java` | SQL-derived role scopes |
| `venture-erp-backend/src/main/java/br/com/venture/ventureflow/user/model/service/UserService.java` | Account lifecycle and conditional role/reseller rules |
| `venture-erp-backend/src/main/resources/application.properties` | Database, JWT, CORS, Flyway, and schema-validation configuration |
| `venture-erp-backend/src/main/resources/db/migration/` | Authoritative schema history |
| `venture-erp-frontend/src/features/auth/AuthContext.tsx` | Browser session restoration and sign-out behavior |
| `venture-erp-frontend/src/shared/api/httpClient.ts` | API base URL, bearer transport, and global 401 handling |
| `venture-erp-frontend/src/App.tsx` | Route and frontend role gates |
| `venture-erp-frontend/src/app/layout/navigationItems.ts` | Role-derived navigation and current reseller-admin gap |
| `venture-erp-frontend/src/features/sales-orders/pages/SalesOrderPage.tsx` | Principal-scoped list presentation and current write-control UI gap |
| `venture-erp-frontend/src/features/sales-orders/pages/CreateSalesOrderPage.tsx` | Reseller-dependent supervisor assignment on creation |
| `venture-erp-frontend/src/features/sales-orders/pages/EditSalesOrderPage.tsx` | Prepopulation and reassignment behavior |
| `venture-erp-frontend/src/shared/components/ActionMenu.tsx` | Shared portal-based action interaction |

## Determination gaps

The repository does not determine the precise commercial meaning of reseller versus customer, final inventory/part-request scope, production database version and deployed schema state, production hosting status, Render/Supabase configuration, CI/CD process, migration rollback policy, audit/retention requirements, sales-order numbering policy, or operational backup and recovery requirements. These remain **Needs confirmation** outside the codebase.
