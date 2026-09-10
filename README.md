# Resource Booking System

A multi-tenant resource booking platform that allows organizations to manage shared resources, handle booking requests, and administer users — all within strict per-organization data isolation.

---

## Overview

The Resource Booking System (RBS) is a full-stack web application that solves the problem of managing shared physical or virtual resources (rooms, equipment, facilities, etc.) across multiple independent organizations. Each organization operates as an isolated tenant: its users, resources, and bookings are completely separate from every other organization on the platform.

The system supports three user roles with distinct capabilities:

| Role | Scope | Description |
|------|-------|-------------|
| `SUPER_ADMIN` | Platform-wide | Manages organizations and their administrators. Does not access tenant booking/resource data. |
| `ADMIN` | Organization-scoped | Manages users, resources, and booking approvals within their organization. |
| `USER` | Organization-scoped | Registers, browses resources, creates bookings, and manages their own bookings. |

---

## Live Application

**Frontend:** [https://resource-booking-client.onrender.com](https://resource-booking-client.onrender.com)

The application is deployed on **[Render](https://render.com)** using a `render.yaml` infrastructure-as-code configuration. The frontend is served as a static site, the backend runs as a Node.js web service, and a managed PostgreSQL database is provisioned automatically.

---

## Key Features

### Multi-Tenant Organization Support
- Each organization is fully isolated. Users, resources, and bookings from one organization are never accessible to another.
- Every organization has a unique URL `slug` used in routing (e.g., `/org/acme/login`).

### Super Admin — Platform Management
- Create new organizations with an initial administrator account (with a Super Admin-supplied temporary password).
- List, view, update, and delete organizations.
- Activate or deactivate organizations platform-wide.
- Add, update, and remove administrator accounts for any organization.
- Cannot delete the `default` organization or organizations containing `SUPER_ADMIN` accounts.

### Authentication
- Organization-scoped login: users log in with email, password, and optionally an organization slug.
- JWT-based session tokens (1-hour expiry).
- bcrypt password hashing (cost factor 12).
- Deactivated users and deactivated organizations are blocked at login and on every authenticated request.
- JWT payload includes `sub` (user ID), `role`, and `organization_id`.

### Password Management
- **Change Password** — authenticated users can update their own password by verifying the current one.
- **First-login password change** — accounts created with temporary passwords have `must_change_password = true`; these ADMINs cannot access any admin functionality until the password is changed.
- **Forgot Password** — sends a time-limited reset link via email (Resend API), valid for 2 minutes, single-use.
- **Password Reset** — validates the token, updates the bcrypt hash, marks the token used.
- **User Invitation** — admins can invite users by email; a 24-hour single-use account-creation link is sent.

### User Management (ADMIN)
- List all users and admins within the organization (with booking count).
- Create additional ADMIN accounts with a temporary password (admin sets it; user must change on first login).
- Activate or deactivate individual user accounts.
- Delete regular USER accounts (cascades bookings and auth tokens). ADMIN/SUPER_ADMIN accounts cannot be deleted through this interface.
- `SUPER_ADMIN` accounts are always excluded from user listings.

### Resource Management (ADMIN)
- Create, update, and delete resources.
- Resource fields: `name`, `type`, `location`, `capacity` (positive integer), `description` (optional), `status` (`ACTIVE`/`INACTIVE`).
- Resources with existing bookings cannot be deleted (enforced by foreign key constraint).
- List/filter resources by status, type, location, or keyword search.

### Booking System (USER)
- Browse and filter resources, then create bookings with `resource_id`, `start_time`, `end_time`, and `purpose`.
- `end_time` must be strictly after `start_time` (enforced in both application code and database constraint).
- Bookings are created with status `PENDING`.
- **Conflict prevention:** a PostgreSQL exclusion constraint (`EXCLUDE USING gist`) prevents any two `PENDING` or `APPROVED` bookings for the same resource from overlapping in time.
- Users can cancel their own `PENDING` or `APPROVED` bookings.
- Users can only view and cancel their own bookings.
- View all active (`PENDING`/`APPROVED`) bookings for a specific resource.

### Booking Administration (ADMIN)
- View all bookings across the organization, optionally filtered by status.
- Approve or reject `PENDING` bookings. Only pending bookings can change status.
- Approval is also subject to the conflict-exclusion constraint (a booking can be rejected if it would conflict).

### Role-Based Access Control
- All resource write operations require `ADMIN` role and a completed password change.
- All admin booking operations require `ADMIN` role and a completed password change.
- SUPER_ADMIN users are explicitly blocked from tenant-scoped routes (`requireTenantUser`).
- Users from one organization cannot access resources, bookings, or users of another organization (`organization_id` is always derived server-side from the JWT, never accepted from the client).

---

## Role-Based Access

| Role | Organization Login | View Resources | Create Booking | Cancel Own Booking | Manage Resources | Approve/Reject Bookings | Manage Users | Super Admin Panel |
|------|--------------------|----------------|----------------|---------------------|------------------|-------------------------|--------------|-------------------|
| `USER` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `SUPER_ADMIN` | ✅ (separate login) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

> **Note:** `ADMIN` users with `must_change_password = true` can only access the Settings page (Change Password). All other admin routes return `403` until the password is changed.

---

## Multi-Tenant Architecture

### Organizations
Every organization is a row in the `organizations` table with a unique `slug`. All tenant data (users, resources, bookings, auth tokens) carries a `NOT NULL` foreign key `organization_id` that references this table.

### Tenant Isolation Enforcement
- `organization_id` is **never** taken from the client request body for scoped queries. It is always read from `request.organizationId`, which is set server-side by `requireTenant` / `requireTenantUser` middleware directly from the JWT payload.
- Every database query for tenant data includes `AND organization_id = $N` as a condition.
- The `requireTenantUser` middleware explicitly rejects `SUPER_ADMIN` tokens from entering tenant routes, so the super admin cannot accidentally query tenant data.

### Organization Slug
Each organization has a unique slug (lowercase alphanumeric + hyphens) used in frontend URLs (e.g., `/org/acme/login`, `/org/acme/admin/settings`). The slug can be resolved to organization metadata via `GET /api/organizations/by-slug/:slug`.

### Super Admin Separation
`SUPER_ADMIN` users log in through a separate login page and are routed to the super admin interface. Their tokens have `role: SUPER_ADMIN` in the JWT payload and are blocked by `requireTenantUser` from accessing any organization's resources, bookings, or user data.

---

## Authentication Flow

```
1. POST /api/auth/login  { email, password, organizationSlug? }
      │
      ├─ Looks up user by email (global lookup)
      ├─ Checks user.status !== 'DEACTIVATED'
      ├─ Checks organization.status !== 'DEACTIVATED'
      ├─ Optionally validates organizationSlug matches user's org
      ├─ bcrypt.compare(password, user.password_hash)
      ├─ Updates last_login timestamp
      └─ Returns JWT { sub, role, organization_id } + user object

2. All subsequent requests:
      Authorization: Bearer <jwt>
      │
      ├─ requireAuth: verifies JWT, re-fetches user from DB,
      │               checks user.status !== 'DEACTIVATED'
      ├─ requireTenant / requireTenantUser: verifies org is ACTIVE,
      │               sets request.organizationId from JWT
      ├─ requireAdmin / requireSuperAdmin: checks role
      └─ requirePasswordChangeComplete: blocks ADMINs with
                       must_change_password = true
```

### User Registration
`POST /api/auth/register/:slug` — public endpoint that creates a `USER` account in the organization identified by `:slug`. The organization must be `ACTIVE`.

### Invitation Flow
1. Admin sends `POST /api/auth/invite` with `{ email }`.
2. Backend creates an `INVITATION` token (24-hour expiry) and emails a link via Resend.
3. Recipient follows the link to `POST /api/auth/create-account` with the token, name, and password.

---

## Password Management

### Change Password
`POST /api/auth/change-password` — authenticated endpoint. Requires `currentPassword` (verified with bcrypt) and `newPassword` (min 8 characters). Sets `must_change_password = false` in the database.

### Forgot Password / Reset Password
1. `POST /api/auth/forgot-password` — accepts email; if an active account exists, creates a `PASSWORD_RESET` token (2-minute expiry, single-use) and sends a reset link via Resend.
2. `POST /api/auth/resend-reset` — re-triggers the same forgot-password flow.
3. `POST /api/auth/reset-password` — validates the token, hashes the new password with bcrypt, marks the token used (`used_at = NOW()`).

**Reset token behaviour:**
- Stored as a SHA-256 hash; the raw token is only ever in the email link.
- Existing active reset tokens are invalidated before a new one is issued.
- Rate-limited: a new token cannot be issued within 60 seconds of the last one.
- Expires in 2 minutes.

### Password Security
- All passwords hashed with bcrypt at cost factor 12.
- `password_hash` is stripped from all user objects returned by the API (`sanitizeUser` utility).
- `must_change_password` is set to `true` for all admin accounts created with a temporary password.

---

## Booking System

### Creating a Booking
Users submit `resource_id`, `start_time` (ISO 8601), `end_time` (ISO 8601), and `purpose`. The controller validates:
- All four fields are present and non-empty.
- `end_time > start_time`.
- The resource belongs to the user's organization and has status `ACTIVE`.

The booking is inserted with status `PENDING`.

### Conflict Prevention
A PostgreSQL exclusion constraint using `btree_gist` prevents any two bookings for the same resource from overlapping when either is `PENDING` or `APPROVED`:
```sql
EXCLUDE USING gist (
  resource_id WITH =,
  tstzrange(start_time, end_time, '[)') WITH &&
) WHERE (status IN ('PENDING', 'APPROVED'));
```
If a conflict is detected at insert time (or at approval time), the database returns error code `23P01`, which the API maps to `409 Conflict`.

### Booking Statuses

| Status | Description |
|--------|-------------|
| `PENDING` | Newly created, awaiting admin action |
| `APPROVED` | Approved by an admin |
| `REJECTED` | Rejected by an admin |
| `CANCELLED` | Cancelled by the user |

### Cancellation
Users can cancel their own `PENDING` or `APPROVED` bookings. `REJECTED` and `CANCELLED` bookings cannot be cancelled again.

### Admin Actions
Only `PENDING` bookings can be approved or rejected. Approving a booking that now conflicts with an already-approved booking is blocked by the exclusion constraint.

---

## Resource Management

Resources are managed by `ADMIN` users through the resource routes. Each resource belongs to one organization.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ | Max 160 chars |
| `type` | string | ✅ | Free-form category |
| `location` | string | ✅ | Free-form location |
| `capacity` | integer | ✅ | Must be > 0 |
| `description` | string | ❌ | Optional free text |
| `status` | enum | — | `ACTIVE` (default) or `INACTIVE` |

Resources with existing bookings (any status) cannot be deleted due to the `ON DELETE RESTRICT` foreign key from `bookings.resource_id`. The API returns `409 Conflict` in this case.

Users can list/filter resources by `status`, `type`, `location`, and keyword `search` (matches name or description). Inactive resources are still visible in filtered queries.

---

## User Management

### User Listing (ADMIN)
`GET /api/admin/users` returns all users and admins in the organization (excluding SUPER_ADMIN), with their booking count. Supports `search` (name/email) and `role` (`USER`/`ADMIN`) query parameters.

### Creating an Admin (ADMIN)
`POST /api/admin/users` creates an `ADMIN` account with a caller-supplied temporary password. The new account has `must_change_password = true`; the new admin must change their password before accessing any admin functionality.

### Activating / Deactivating Users (ADMIN)
`PATCH /api/admin/users/:id/status` — sets user status to `ACTIVE` or `DEACTIVATED`. Cannot target `SUPER_ADMIN` accounts.

### Deleting Users (ADMIN)
`DELETE /api/admin/users/:id` — deletes regular `USER` accounts only. This cascades to delete the user's bookings and auth tokens within the same transaction. `ADMIN` and `SUPER_ADMIN` accounts cannot be deleted through this route.

---

## Super Admin — Platform Management

The Super Admin interface is accessible via a separate login page. All routes require `SUPER_ADMIN` role.

### Organization Management
| Action | Description |
|--------|-------------|
| List organizations | Returns all orgs with user/resource/booking counts |
| Create organization | Creates org + initial ADMIN with temporary password (bcrypt-hashed, `must_change_password = true`) atomically |
| Get organization details | Returns org info, all admins, and aggregate counts |
| Update organization | Updates name, slug, and logo |
| Update organization status | Activates or deactivates an organization; cannot deactivate the `default` org |
| Delete organization | Deletes org and all cascaded data; blocked if org contains SUPER_ADMIN accounts or is the `default` org |

### Organization Admin Management
| Action | Description |
|--------|-------------|
| Provision admin | Adds another admin to an existing organization; sends a password-reset email for initial login |
| Update admin | Updates name, email, and/or status of an admin in a specific org |
| Delete admin | Removes an admin account from a specific org |

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^18.3.1 | UI framework |
| Vite | ^6.0.5 | Build tool and dev server |
| React Router DOM | ^7.18.2 | Client-side routing |
| Recharts | ^3.10.1 | Charts (reports/analytics) |
| Lucide React | ^1.34.0 | Icon library |
| date-fns | ^4.4.0 | Date formatting |
| Vanilla CSS | — | Styling (no Tailwind) |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | — | Runtime (ESM modules) |
| Express | ^4.21.2 | HTTP framework |
| pg | ^8.13.1 | PostgreSQL client |
| bcrypt | ^5.1.1 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT signing/verification |
| dotenv | ^16.4.7 | Environment variable loading |

### Database & Deployment

| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary database; uses `btree_gist` extension for booking exclusion constraints |
| Render | Hosting for frontend (static), backend (Node.js web service), and PostgreSQL (managed) |
| Resend | Transactional email (invitations, password resets) |

---

## Project Structure

```
resource-booking-system/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx                  # Root router
│   │   ├── main.jsx
│   │   ├── styles.css               # Global styles
│   │   ├── components/
│   │   │   └── ui/                  # Button, Card, Input, Modal, Table, Badge, etc.
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── OrganizationContext.jsx
│   │   ├── layouts/                 # Layout wrappers
│   │   ├── pages/
│   │   │   ├── admin/               # AdminDashboard, AdminSettings, ResourceManagement, etc.
│   │   │   ├── auth/                # Login, Register, ForgotPassword, ResetPassword, etc.
│   │   │   ├── super-admin/         # OrganizationsList, OrganizationCreate, OrganizationDetails, etc.
│   │   │   └── user/                # User-facing booking pages
│   │   └── services/
│   │       ├── api.js               # Fetch wrapper with JWT header injection
│   │       ├── auth.service.js
│   │       ├── admin.service.js
│   │       ├── superAdmin.service.js
│   │       ├── booking.service.js
│   │       └── resource.service.js
│   └── package.json
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── app.js                   # Express app, CORS, route mounting
│   │   ├── server.js                # Entry point; starts HTTP server
│   │   ├── config/
│   │   │   ├── database.js          # pg pool setup
│   │   │   └── env.js               # Environment variable validation
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── resourceController.js
│   │   │   ├── userController.js
│   │   │   ├── organizationController.js
│   │   │   ├── superAdminController.js
│   │   │   ├── adminBookingController.js  # Re-exports from bookingController
│   │   │   └── healthController.js
│   │   ├── db/
│   │   │   └── migrations/          # SQL migration files (001–007)
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # requireAuth, requireAdmin, requireSuperAdmin, requirePasswordChangeComplete
│   │   │   ├── tenantMiddleware.js  # requireTenant, requireTenantUser
│   │   │   └── adminMiddleware.js   # requireAdmin (used on specific routes)
│   │   ├── models/
│   │   │   ├── bookingModel.js
│   │   │   ├── resourceModel.js
│   │   │   └── userModel.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── adminBookingRoutes.js
│   │   │   ├── adminUserRoutes.js
│   │   │   ├── resourceRoutes.js
│   │   │   ├── organizationRoutes.js
│   │   │   ├── superAdminRoutes.js
│   │   │   └── healthRoutes.js
│   │   ├── utils/
│   │   │   ├── email.js             # Resend email helpers
│   │   │   └── user.js              # sanitizeUser (strips password_hash)
│   │   └── services/                # (reserved, currently empty)
│   ├── scripts/
│   │   └── provisionSuperAdmin.js   # Run at deploy time to seed SUPER_ADMIN
│   ├── migrate.js                   # Migration runner
│   └── package.json
├── render.yaml                      # Render deployment configuration
├── README.md
└── API_DOCUMENTATION.md
```

---

## Environment Variables

### Backend (required at runtime)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWTs; auto-generated by Render |
| `SUPER_ADMIN_NAME` | ✅ (deploy) | Full name for the initial Super Admin account |
| `SUPER_ADMIN_EMAIL` | ✅ (deploy) | Email address for the initial Super Admin account |
| `SUPER_ADMIN_PASSWORD` | ✅ (deploy) | Password for the initial Super Admin account |
| `FRONTEND_URL` | ✅ | Frontend origin for CORS and email link generation |
| `RESEND_API_KEY` | ❌ | Resend API key; email features are disabled if not set |
| `EMAIL_FROM` | ❌ | Sender address; defaults to `onboarding@resend.dev` |
| `PORT` | ❌ | HTTP port; defaults to `5000` |
| `NODE_ENV` | ❌ | Set to `production` on Render |

### Frontend (build-time)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ❌ | Full API base URL (e.g., `https://resource-booking-api.onrender.com/api`). Falls back to `http://localhost:5000/api` in development and `/api` in production. |

**Example `.env` for local development (server):**
```
DATABASE_URL=postgresql://user:password@localhost:5432/rbs
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
SUPER_ADMIN_NAME=Platform Admin
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=your_super_admin_password
```

---

## Local Development Setup

### Prerequisites
- Node.js (18+)
- PostgreSQL (14+ with `btree_gist` extension available)

### 1. Clone the repository
```bash
git clone https://github.com/your-org/resource-booking-system.git
cd resource-booking-system
```

### 2. Install backend dependencies
```bash
cd server
npm install
```

### 3. Install frontend dependencies
```bash
cd ../client
npm install
```

### 4. Configure backend environment
Create `server/.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/rbs
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
SUPER_ADMIN_NAME=Platform Admin
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=your_super_admin_password
```

### 5. Create the PostgreSQL database
```bash
createdb rbs
```

### 6. Run migrations
```bash
cd server
npm run migrate
```

### 7. Provision the Super Admin account
```bash
npm run provision-super-admin
```

### 8. Start the backend (development mode with file watching)
```bash
npm run dev
```
The API will be available at `http://localhost:5000`.

### 9. Start the frontend
In a separate terminal:
```bash
cd client
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## Database & Migrations

Migrations are plain SQL files located in `server/src/db/migrations/` and executed in order by `server/migrate.js`. The runner tracks which migrations have been applied using a `migrations` table.

| File | What it introduces |
|------|--------------------|
| `001_initial_schema.sql` | `users`, `resources`, `bookings` tables; `user_role`, `resource_status`, `booking_status` enums; booking exclusion constraint (`btree_gist`); `set_updated_at` trigger |
| `002_user_status.sql` | `user_status` enum; `users.status` column (`ACTIVE`/`DEACTIVATED`) |
| `003_last_login.sql` | `users.last_login` timestamp column |
| `004_auth_tokens.sql` | `auth_tokens` table with `INVITATION`/`PASSWORD_RESET` types |
| `005_multi_tenant.sql` | `organizations` table; `SUPER_ADMIN` role value; `organization_id` foreign keys on all tables |
| `006_auth_tokens_org.sql` | Compatibility/repair migration ensuring `auth_tokens.organization_id` is fully constrained |
| `007_must_change_password.sql` | `users.must_change_password` boolean column |

To run migrations:
```bash
cd server
npm run migrate
```

---

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for the complete endpoint reference.

---

## Deployment

The project is deployed on Render using `render.yaml`.

### Services

| Service | Type | Root Dir | Build Command | Start Command |
|---------|------|----------|---------------|---------------|
| `resource-booking-api` | Node.js Web Service | `server/` | `npm install && npm run migrate && npm run provision-super-admin` | `npm start` |
| `resource-booking-client` | Static Site | `client/` | `npm install && VITE_API_URL="..." npm run build` | — |
| `resource-booking-db` | PostgreSQL (managed) | — | — | — |

### Environment Variable Wiring
- `DATABASE_URL` is automatically set from the managed database's connection string.
- `JWT_SECRET` is auto-generated by Render.
- `FRONTEND_URL` (backend) is automatically set to the frontend service's external URL.
- `BACKEND_URL` (client build) is automatically set to the backend service's external URL.
- `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `RESEND_API_KEY`, and `EMAIL_FROM` must be set manually in the Render dashboard.

### Notes
- The migration runner and Super Admin provisioning script run automatically on every deploy.
- The frontend is a static build with all routes rewritten to `/index.html` (SPA routing).
- CORS is configured server-side to allow requests only from the known frontend origin.

---

## Security

The following security controls are implemented in the current codebase:

| Control | Implementation |
|---------|----------------|
| Password hashing | bcrypt, cost factor 12 |
| Password stripping | `sanitizeUser()` removes `password_hash` from all API responses |
| JWT authentication | `jsonwebtoken`; tokens verified on every authenticated request by re-querying the database |
| Role-based authorization | `requireAdmin`, `requireSuperAdmin` middleware checked on every route |
| Tenant isolation | `organization_id` derived exclusively from JWT, never from client input |
| Deactivated account checks | Checked in `requireAuth` on every request |
| Deactivated organization checks | Checked in `requireTenant`/`requireTenantUser` on every request |
| First-login password enforcement | `requirePasswordChangeComplete` blocks all admin routes until password is changed |
| Password reset token security | Tokens stored as SHA-256 hashes; raw token only in the email link; 2-minute expiry; single-use (`used_at`) |
| SQL injection prevention | All database queries use parameterized statements (`pg` library, `$1/$2/...` placeholders) |
| Booking conflict enforcement | PostgreSQL exclusion constraint (database-level, not application-level only) |
| CORS | Manual CORS middleware; only the configured `FRONTEND_URL` and `http://localhost:5173` are allowed |
| Deletion guards | `SUPER_ADMIN` and `default` organization cannot be deleted; admin accounts cannot be deleted from the user management interface |

> **Not implemented:** Helmet, rate limiting (beyond the 60-second email rate limit), CSRF tokens.

---

## Health Check

```
GET /api/health
```

Returns `200 OK` with `{ "success": true, "message": "Resource Booking API is running" }`. No authentication required.

---

## Error Handling

All API responses follow a consistent JSON envelope:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human-readable error description."
}
```

Common HTTP status codes used:

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request / validation failure |
| `401` | Unauthenticated |
| `403` | Forbidden (wrong role, deactivated, org deactivated, password change required) |
| `404` | Resource not found |
| `409` | Conflict (duplicate slug/email, booking overlap, cancelled booking) |
| `500` | Internal server error |

---

## Development Notes

- The backend uses **ES Modules** (`"type": "module"` in `package.json`). All imports use `.js` extensions.
- The backend dev server uses `node --watch` (native Node.js file watching, no nodemon required).
- `SUPER_ADMIN` tokens are blocked by `requireTenantUser` from entering any organization-scoped route. Use separate test accounts for testing tenant flows.
- The booking exclusion constraint requires the PostgreSQL `btree_gist` extension. This is created in `001_initial_schema.sql` via `CREATE EXTENSION IF NOT EXISTS btree_gist`.
- Email sending is optional: if `RESEND_API_KEY` is not set, the email functions throw an error that is caught and logged. The application continues to work; only email delivery fails.
- The `default` organization is seeded by migration `005` and is protected from deactivation and deletion.

---

## Security

### Server-Side Rate Limiting

The API uses **[express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)** for server-side rate limiting. All rate-limiting state is held in memory on the server — it cannot be bypassed by manipulating client-side state.

| Endpoint / Scope         | Limit | Window | Purpose |
|--------------------------|------:|-------:|---------|
| General `/api/*`         | 300 requests | 15 minutes | Broad abuse and DDoS protection |
| `POST /api/auth/login`   | 10 requests  | 15 minutes | Brute-force credential attack prevention |
| `POST /api/auth/register/:slug` | 5 requests | 15 minutes | Mass account creation prevention |
| `POST /api/auth/forgot-password` | 5 requests | 15 minutes | Email spam / enumeration prevention |
| `POST /api/auth/resend-reset` | 5 requests | 15 minutes | Email spam prevention |

When any limit is exceeded, the server responds with **HTTP 429 Too Many Requests** and a JSON body:

```json
{
  "success": false,
  "error": "TOO_MANY_REQUESTS",
  "message": "Too many requests. Please wait a few minutes and try again."
}
```

No HTML error pages are returned. Stack traces and internal details are never exposed.

### Production / Proxy Considerations

The application is deployed on **Render**, which acts as a reverse proxy. When deploying on Render (or behind any trusted reverse proxy), review whether `app.set('trust proxy', N)` is required to ensure client IPs are identified correctly for rate limiting. See [`render.yaml`](./render.yaml) and the [express-rate-limit proxy documentation](https://express-rate-limit.mintlify.app/guides/troubleshooting-proxy-issues) before deploying to a new environment.

---

## License

License: Not specified.
